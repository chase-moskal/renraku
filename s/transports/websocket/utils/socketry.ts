
import * as ws from "ws"
import {JsonRpc} from "../../../core/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"
import {Logger} from "../../../tools/logging/logger.js"
import {errorString} from "../../../tools/error-string.js"
import {Endpoint, HttpHeaders} from "../../../core/types.js"

export type SocketryOptions = {
	logger: Logger
	timeout: number
	localEndpoint: Endpoint
	send: (data: string) => void
	closed: () => void
}

export class Socketry {
	waiter: ResponseWaiter

	constructor(private options: {
			timeout: number
			send: (data: string) => void
		}) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	remoteEndpoint: Endpoint = async request => {
		this.options.send(JSON.stringify(request))
		return "id" in request
			? await this.waiter.wait(request.id)
			: null
	}

	applyToSocket(socket: WebSocket | ws.WebSocket, applicative: {
			logger: Logger
			exposeErrors: boolean
			headers: HttpHeaders
			localEndpoint: Endpoint
			closed: () => void
		}) {

		const processMessage = async(message: JsonRpc.Request | JsonRpc.Response) => {
			if ("method" in message)
				return await applicative.localEndpoint(
					message,
					{
						headers: applicative.headers,
						exposeErrors: applicative.exposeErrors,
					},
				)
			else
				this.waiter.deliverResponse(message)
		}

		socket.onclose = () => {
			applicative.closed()
		}

		socket.onerror = () => {
			applicative.logger.error(errorString(null, "socket error"))
			applicative.closed()
		}

		socket.onmessage = async(event: any) => {
			const bi: JsonRpc.Bidirectional = JSON.parse(event.data.toString())

			if (Array.isArray(bi)) {
				const responses = (await Promise.all(bi.map(processMessage)))
					.filter(r => !!r)
				if (responses.length > 0)
					this.options.send(JSON.stringify(responses))
			}
			else {
				const response = await processMessage(bi)
				if (response)
					this.options.send(JSON.stringify(response))
			}
		}
	}
}

