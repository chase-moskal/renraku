
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

	constructor(options: MessengerOptions<xRemoteFns>) {
		const localSide = options.local
		const loggers = new Loggers()
		const {
			onCall = loggers.onCall,
			onError = loggers.onError,
			onCallError = loggers.onCallError,
		} = options

		this.bidirectional = new Bidirectional({
			timeout: options.timeout ?? defaults.timeout,
			onSend: (outgoing, transfer) => {
				options.remote.port.postMessage(
					outgoing,
					options.remote.getOrigin(),
					transfer,
				)
			},
		})

		this.remote = remote<xRemoteFns>(this.bidirectional.remoteEndpoint, {onCall})

		if (localSide) {
			const listener = (event: MessageEvent) => {
				const localEndpoint = localSide.getEndpoint(event, this.remote, {onCall, onCallError})
				this.bidirectional.receive(localEndpoint, event.data)
					.catch(onError)
			}
			localSide.port.addEventListener("message", listener)
			this.dispose = () => localSide.port.removeEventListener("message", listener)
		}
	}
}

