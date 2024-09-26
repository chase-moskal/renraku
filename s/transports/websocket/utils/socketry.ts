
import * as ws from "ws"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"
import {Endpoint} from "../../../core/types.js"

export type SocketryOptions = {
	timeout: number
	socket: WebSocket | ws.WebSocket
	onError: (error: any) => void
}

export type SocketryMessageEvent = {
	data: any
}

export class Socketry {
	waiter: ResponseWaiter

	constructor(private options: SocketryOptions) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	remoteEndpoint: Endpoint = async request => {
		this.options.socket.send(JSON.stringify(request))
		return "id" in request
			? await this.waiter.wait(request.id, request.method)
			: null
	}

	prepareMessageHandler(localEndpoint: Endpoint | null) {
		const {socket} = this.options

		const processMessage = async(message: JsonRpc.Request | JsonRpc.Response) => {
			if ("method" in message) {
				if (localEndpoint)
					return await localEndpoint(message)
			}
			else
				this.waiter.deliverResponse(message)
		}

		const onmessage = async(event: SocketryMessageEvent) => {
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

		return async(event: SocketryMessageEvent) => {
			try {
				return await onmessage(event)
			}
			catch (error) {
				this.options.onError(error)
			}
		}
	}
}

