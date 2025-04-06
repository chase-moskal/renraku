
import {BasePortal} from "./portals.js"
import {Logistics} from "../utils/logistics.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns, OnCall, OnError} from "../../core/types.js"

export type MessageBindables = {
	addEventListener(e: "message", listener: (event: MessageEvent) => void): void
	removeEventListener(e: "message", listener: (event: MessageEvent) => void): void
}

export type MessengerOptions<xRemoteFns extends Fns> = {
	remotePortal: BasePortal
	getLocalEndpoint?: (
		remote: Remote<xRemoteFns>,
		logistics: Logistics,
		event: MessageEvent,
	) => Endpoint
	timeout?: number
	onError?: OnError
	onCall?: OnCall
}

