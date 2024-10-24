
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
	bidirectional: Bidirectional

	constructor(options: SocketryOptions) {
		this.bidirectional = new Bidirectional({
			timeout: options.timeout,
			onError: options.onError,
			onSend: outgoing => options.socket.send(JSON.stringify(outgoing)),
		})
	}

	get remoteEndpoint() {
		return this.bidirectional.remoteEndpoint
	}

	async receive(localEndpoint: Endpoint | null, event: SocketryMessageEvent) {
		const incoming = JSON.parse(event.data.toString())
		return this.bidirectional.receive(localEndpoint, incoming)
	}
}

