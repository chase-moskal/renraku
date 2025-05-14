
import type * as ws from "ws"
import {Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"

export class WebSocketConduit extends Conduit {
	#trash = new Trash()

	constructor(channel: WebSocket | ws.WebSocket) {
		super()
		this.#trash.add(
			this.sendRequest.sub(m => channel.send(JSON.stringify(m))),
			this.sendResponse.sub(m => channel.send(JSON.stringify(m))),
		)

		channel.onmessage = (e: MessageEvent) => this.recv(
			JSON.parse(e.data.toString()),
			e,
		)

		this.#trash.add(() => {
			channel.onmessage = () => {}
		})
	}

	dispose() {
		this.#trash.dispose()
	}
}

