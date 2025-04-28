
import type * as ws from "ws"
import {Conduit} from "./conduit.js"

export class WebSocketConduit extends Conduit {
	constructor(channel: WebSocket | ws.WebSocket) {
		super()
		this.sendRequest.sub(m => channel.send(JSON.stringify(m)))
		this.sendResponse.sub(m => channel.send(JSON.stringify(m)))
		channel.onmessage = (e: MessageEvent) => this.recv(JSON.parse(e.data.toString()))
	}
}

