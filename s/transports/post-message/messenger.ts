
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {Remote} from "../../core/remote-proxy.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {Bidirectional} from "../utils/bidirectional.js"
import {Endpoint, Fns, OnCall, OnError} from "../../core/types.js"
import {BroadcastPortal, MessagePortal, Portal, WindowPortal} from "./portals.js"

export class Rig<xPortal extends Portal = Portal> {
	transfer: Transferable[] | undefined = undefined
	constructor(public event: MessageEvent, public portal: xPortal) {}
}

export type MessengerOptions<xRemoteFns extends Fns, xPortal extends Portal = Portal> = {
	portal: xPortal
	getLocalEndpoint?: (
		remote: Remote<xRemoteFns>,
		rig: Rig<xPortal>,
		event: MessageEvent,
	) => Endpoint
	timeout?: number
	onError?: OnError
	onCall?: OnCall
}

export class Messenger<xRemoteFns extends Fns, xPortal extends Portal = Portal> {
	static WindowPortal = WindowPortal
	static BroadcastPortal = BroadcastPortal
	static MessagePortal = MessagePortal

	bidirectional: Bidirectional<Rig>
	remote: Remote<xRemoteFns>
	dispose = () => {}

	constructor(public options: MessengerOptions<xRemoteFns, xPortal>) {
		const loggers = new Loggers()
		const {getLocalEndpoint, portal} = options

		this.bidirectional = new Bidirectional({
			timeout: options.timeout ?? defaults.timeout,
			sendRequest: (message, transfer, done) => portal.sendRequest(message, transfer, done),
			sendResponse: (message, rig) => portal.sendResponse(message, rig),
		})

		this.remote = remote<xRemoteFns>(this.bidirectional.remoteEndpoint, {onCall: options.onCall ?? loggers.onCall})

		this.dispose = portal.onMessage((event: MessageEvent) => {
			const rig = new Rig<xPortal>(event, options.portal)
			const localEndpoint = getLocalEndpoint
				? getLocalEndpoint(this.remote, rig, event)
				: null
			this.bidirectional.receive(localEndpoint, event.data, rig)
				.catch(options.onError ?? loggers.onError)
		})
	}

	get portal() {
		return this.options.portal
	}
}

