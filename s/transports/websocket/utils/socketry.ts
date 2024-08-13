
import * as ws from "ws"
import {JsonRpc} from "../../../core/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"
import {Endpoint, HttpHeaders} from "../../../core/types.js"

export type SocketryOptions = {
	timeout: number
	headers: HttpHeaders
	exposeErrors: boolean
	socket: WebSocket | ws.WebSocket
}

export class Socketry {
	waiter: ResponseWaiter

	constructor(private options: SocketryOptions) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	remoteEndpoint: Endpoint = async request => {
		this.options.socket.send(JSON.stringify(request))
		return "id" in request
			? await this.waiter.wait(request.id)
			: null
	}

	prepareMessageHandler(localEndpoint: Endpoint | null) {
		const {socket, headers, exposeErrors} = this.options

		const processMessage = async(message: JsonRpc.Request | JsonRpc.Response) => {
			if ("method" in message) {
				if (localEndpoint)
					return await localEndpoint(message, {headers, exposeErrors})
			}
			else
				this.waiter.deliverResponse(message)
		}

		const onmessage = async(event: any) => {
			const bi: JsonRpc.Bidirectional = JSON.parse(event.data.toString())

			if (Array.isArray(bi)) {
				const responses = (await Promise.all(bi.map(processMessage)))
					.filter(r => !!r)
				if (responses.length > 0)
					socket.send(JSON.stringify(responses))
			}
			else {
				const response = await processMessage(bi)
				if (response)
					socket.send(JSON.stringify(response))
			}
		}

		return onmessage
	}
}

