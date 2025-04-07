
import {Rig} from "../utils/rig.js"
import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {MessengerOptions} from "./types.js"
import {Remote} from "../../core/remote-proxy.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {Bidirectional} from "../utils/bidirectional.js"
import {BroadcastPortal, MessagePortal, WindowPortal} from "./portals.js"

export class Messenger<xRemoteFns extends Fns> {
	static WindowPortal = WindowPortal
	static BroadcastPortal = BroadcastPortal
	static MessagePortal = MessagePortal

	bidirectional: Bidirectional
	remote: Remote<xRemoteFns>
	dispose = () => {}

	constructor(public options: MessengerOptions<xRemoteFns>) {
		const loggers = new Loggers()
		const {getLocalEndpoint, remotePortal} = options

		this.bidirectional = new Bidirectional({
			timeout: options.timeout ?? defaults.timeout,
			sendRequest: (message, transfer, done) => remotePortal.sendRequest(message, transfer, done),
			sendResponse: (message, transfer) => remotePortal.sendResponse(message, transfer),
		})

		this.remote = remote<xRemoteFns>(this.bidirectional.remoteEndpoint, {onCall: options.onCall ?? loggers.onCall})

		const listener = (event: MessageEvent) => {
			const rig = new Rig()
			const localEndpoint = getLocalEndpoint
				? getLocalEndpoint(this.remote, rig, event)
				: null
			this.bidirectional.receive(localEndpoint, event.data, rig)
				.catch(options.onError ?? loggers.onError)
		}
		remotePortal.channel.addEventListener("message", listener)
		this.dispose = () => remotePortal.channel.removeEventListener("message", listener)
	}

	get portal() {
		return this.options.remotePortal
	}
}

