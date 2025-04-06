
import {BasePortal} from "./portals.js"
import {Logistics} from "../utils/logistics.js"
import {Remote} from "../../core/remote-proxy.js"
import {EndpointOptions} from "../../core/endpoint.js"
import {Endpoint, Fns, OnCall, OnCallError, OnError} from "../../core/types.js"

export type MessageBindables = {
	addEventListener(e: "message", listener: (event: MessageEvent) => void): void
	removeEventListener(e: "message", listener: (event: MessageEvent) => void): void
}

export type MessengerLocal<xRemoteFns extends Fns> = {
	port: BasePortal
	getEndpoint: (
		event: MessageEvent,
		remote: Remote<xRemoteFns>,
		logistics: Logistics,
		options: EndpointOptions,
	) => Endpoint
}

export type MessengerRemote = {
	port: BasePortal
	getOrigin: () => string
}

export type MessengerOptions<xRemoteFns extends Fns> = {
	remote: MessengerRemote
	local?: MessengerLocal<xRemoteFns>
	timeout?: number
	onError?: OnError
	onCall?: OnCall
	onCallError?: OnCallError
}

