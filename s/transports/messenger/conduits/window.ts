
import {Conduit} from "./conduit.js"
import {ChannelMessage} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class WindowConduit extends Conduit {
	constructor(
			channel: Window,
			targetOrigin: string,
			allow: (e: ChannelMessage) => boolean = () => false,
		) {

		super()
		this.sendRequest.sub((m, transfer) => channel.postMessage(m, targetOrigin, transfer))
		this.sendResponse.sub((m, transfer) => channel.postMessage(m, targetOrigin, transfer))

		onMessage(channel, e => {
			if (allow(e))
				this.recv(e.data)
		})
	}
}

