
import {Trash} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {PostableChannel} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class PostableConduit extends Conduit {
	#trash = new Trash()

	constructor(channel: PostableChannel) {
		super()
		this.#trash.add(
			this.sendRequest.sub((m, transfer) => channel.postMessage(m, transfer)),
			this.sendResponse.sub((m, transfer) => channel.postMessage(m, transfer)),
			onMessage(channel, e => this.recv(e.data, e)),
		)
	}

	dispose() {
		this.#trash.dispose()
	}
}

