
import * as ws from "ws"
import {Rig} from "../../utils/rig.js"
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

	constructor(private options: SocketryOptions) {
		this.bidirectional = new Bidirectional({
			timeout: options.timeout,
			onSend: outgoing => options.socket.send(JSON.stringify(outgoing)),
		})
	}

	get remoteEndpoint() {
		return this.bidirectional.remoteEndpoint
	}

	async receive(localEndpoint: Endpoint | null, event: SocketryMessageEvent) {
		try {
			const incoming = JSON.parse(event.data.toString())
			return await this.bidirectional.receive(localEndpoint, incoming, new Rig())
		}
		catch (error) {
			this.options.onError(error)
		}
	}
}

