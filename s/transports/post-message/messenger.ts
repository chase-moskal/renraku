
import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {MessengerOptions} from "./types.js"
import {Logistics} from "../utils/logistics.js"
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

	constructor(options: MessengerOptions<xRemoteFns>) {
		const loggers = new Loggers()
		const {getLocalEndpoint, remotePortal} = options

		this.bidirectional = new Bidirectional({
			timeout: options.timeout ?? defaults.timeout,
			onSend: (outgoing, transfer) => remotePortal.send(outgoing, transfer),
		})

		this.remote = remote<xRemoteFns>(this.bidirectional.remoteEndpoint, {onCall: options.onCall ?? loggers.onCall})

		const listener = (event: MessageEvent) => {
			const logistics = new Logistics()
			const localEndpoint = getLocalEndpoint
				? getLocalEndpoint(this.remote, logistics, event)
				: null
			this.bidirectional.receive(localEndpoint, event.data, logistics)
				.catch(options.onError ?? loggers.onError)
		}
		remotePortal.addEventListener("message", listener)
		this.dispose = () => remotePortal.removeEventListener("message", listener)
	}
}

