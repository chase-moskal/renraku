
import type * as ws from "ws"
import {Conduit} from "../parts/conduit.js"

export class SocketConduit extends Conduit {
	constructor(channel: WebSocket | ws.WebSocket) {
		super()
		this.sendRequest.sub(m => channel.send(JSON.stringify(m)))
		this.sendResponse.sub(m => channel.send(JSON.stringify(m)))
		channel.onmessage = (e: MessageEvent) => this.recv(JSON.parse(e.data.toString()))
	}
}

