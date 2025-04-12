
import type * as ws from "ws"

import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {pubsub} from "../../tools/pubsub.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns} from "../../core/types.js"
import {disposers} from "../../tools/disposers.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {ResponseWaiter} from "../utils/response-waiter.js"
import {MessengerOptions, PostableChannel} from "./types.js"
import {onMessage, handleIncomingRequests, interpretIncoming, makeRemoteEndpoint, Rig} from "./parts/helpers.js"

export class Messenger<xRemoteFns extends Fns> {
	waiter: ResponseWaiter
	remoteEndpoint: Endpoint
	remote: Remote<xRemoteFns>

	onSendRequest = pubsub<[request: JsonRpc.Requestish, transfer: Transferable[] | undefined]>()
	onSendResponse = pubsub<[response: JsonRpc.Respondish, transfer: Transferable[] | undefined]>()

	constructor(public options: MessengerOptions<xRemoteFns>) {
		const loggers = new Loggers()
		this.waiter = new ResponseWaiter(options.timeout ?? defaults.timeout)
		this.remoteEndpoint = makeRemoteEndpoint(this.waiter, this.onSendRequest.publish)
		this.remote = remote<xRemoteFns>(this.remoteEndpoint, {onCall: options.onCall ?? loggers.onCall})
	}

	async recv(incoming: JsonRpc.Bidirectional) {
		const rig = new Rig()
		const {getLocalEndpoint} = this.options

		const {requests, responses} = interpretIncoming(incoming)

		for (const response of responses)
			this.waiter.deliverResponse(response)

		if (!getLocalEndpoint)
			return null

		const outgoing = await handleIncomingRequests(getLocalEndpoint(this.remote, rig), requests)
		if (outgoing)
			await this.onSendResponse.publish(outgoing, rig.transfer)
	}

	attach(channel: PostableChannel) {
		return disposers(
			this.onSendRequest((m, transfer) => channel.postMessage(m, transfer)),
			this.onSendResponse((m, transfer) => channel.postMessage(m, transfer)),
			onMessage(channel, e => this.recv(e.data)),
		)
	}

	attachWindow(channel: Window, targetOrigin: string) {
		return disposers(
			this.onSendRequest((m, transfer) => channel.postMessage(m, targetOrigin, transfer)),
			this.onSendResponse((m, transfer) => channel.postMessage(m, targetOrigin, transfer)),
			onMessage(channel, e => this.recv(e.data)),
		)
	}

	attachBroadcastChannel(channel: BroadcastChannel) {
		return disposers(
			this.onSendRequest(m => channel.postMessage(m)),
			this.onSendResponse(m => channel.postMessage(m)),
			onMessage(channel, e => this.recv(e.data)),
		)
	}

	attachSocket(channel: WebSocket | ws.WebSocket) {
		channel.onmessage = (e: MessageEvent) => this.recv(JSON.parse(e.data.toString()))
		return disposers(
			this.onSendRequest(m => channel.send(JSON.stringify(m))),
			this.onSendResponse(m => channel.send(JSON.stringify(m))),
			() => { channel.onmessage = () => {} },
		)
	}
}

