
import {Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {onMessage} from "../parts/helpers.js"

export class BroadcastConduit extends Conduit {
	#trash = new Trash()

	constructor(channel: BroadcastChannel) {
		super()
		this.#trash.add(
			this.sendRequest.sub(m => channel.postMessage(m)),
			this.sendResponse.sub(m => channel.postMessage(m)),
			onMessage(channel, e => this.recv(e.data)),
		)
	}

	dispose() {
		this.#trash.dispose()
	}
}

