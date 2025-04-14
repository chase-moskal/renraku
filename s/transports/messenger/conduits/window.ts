
import {Conduit} from "../parts/conduit.js"
import {onMessage} from "../parts/helpers.js"

export class WindowConduit extends Conduit {
	constructor(channel: Window, targetOrigin: string) {
		super()
		this.sendRequest.sub((m, transfer) => channel.postMessage(m, targetOrigin, transfer))
		this.sendResponse.sub((m, transfer) => channel.postMessage(m, targetOrigin, transfer))
		onMessage(channel, e => this.recv(e.data))
	}
}

