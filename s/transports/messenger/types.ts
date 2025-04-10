
import {Rig} from "./parts/helpers.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns, OnCall, OnError} from "../../core/types.js"

export type MessengerOptions<xRemoteFns extends Fns> = {
	getLocalEndpoint?: (
		remote: Remote<xRemoteFns>,
		rig: Rig,
	) => Endpoint
	timeout?: number
	onError?: OnError
	onCall?: OnCall
}

export type ChannelMessage<D = any> = {data: D}

export type Channel = {
	addEventListener(e: "message", listener: (event: ChannelMessage) => void): void
	removeEventListener(e: "message", listener: (event: ChannelMessage) => void): void
}

export type PostableChannel = {
	postMessage(m: any, transfer?: Transferable[]): void
} & Channel

