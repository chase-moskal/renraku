
import {Conduit} from "./conduit.js"
import {PostableChannel} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class PostableConduit extends Conduit {
	constructor(channel: PostableChannel) {
		super()
		this.sendRequest.sub((m, transfer) => channel.postMessage(m, transfer))
		this.sendResponse.sub((m, transfer) => channel.postMessage(m, transfer))
		onMessage(channel, e => this.recv(e.data))
	}
}

