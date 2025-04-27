
import {Conduit} from "../parts/conduit.js"
import {onMessage} from "../parts/helpers.js"

export class BroadcastConduit extends Conduit {
	constructor(channel: BroadcastChannel) {
		super()
		this.sendRequest.sub(m => channel.postMessage(m))
		this.sendResponse.sub(m => channel.postMessage(m))
		onMessage(channel, e => this.recv(e.data))
	}
}

