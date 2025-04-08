
import * as ws from "ws"
import {Endpoint} from "../../../core/types.js"
import {Bidirectional} from "../../utils/bidirectional.js"

export type SocketryOptions = {
	timeout: number
	socket: WebSocket | ws.WebSocket
	onError: (error: any) => void
}

export type SocketryMessageEvent = {
	data: any
}

export class Socketry {
	bidirectional: Bidirectional<undefined>

	constructor(private options: SocketryOptions) {
		this.bidirectional = new Bidirectional({
			timeout: options.timeout,
			sendRequest: message => options.socket.send(JSON.stringify(message)),
			sendResponse: message => options.socket.send(JSON.stringify(message)),
		})
	}

	get remoteEndpoint() {
		return this.bidirectional.remoteEndpoint
	}

	async receive(localEndpoint: Endpoint | null, event: SocketryMessageEvent) {
		try {
			const incoming = JSON.parse(event.data.toString())
			return await this.bidirectional.receive(localEndpoint, incoming, undefined)
		}
		catch (error) {
			this.options.onError(error)
		}
	}
}

