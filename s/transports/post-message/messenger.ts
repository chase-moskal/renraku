
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {pubsub} from "../../tools/pubsub.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {Remote} from "../../core/remote-proxy.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {ResponseWaiter} from "../utils/response-waiter.js"
import {Endpoint, Fns, OnCall, OnError} from "../../core/types.js"
import {handleIncomingRequests, interpretIncoming, makeRemoteEndpoint} from "../utils/helpers.js"

export class Rig {
	transfer: Transferable[] | undefined = undefined
}

export type MessengerOptions<xRemoteFns extends Fns> = {
	getLocalEndpoint?: (
		remote: Remote<xRemoteFns>,
		rig: Rig,
	) => Endpoint
	timeout?: number
	onError?: OnError
	onCall?: OnCall
}

export type Portal = {
	addEventListener(e: "message", listener: (event: MessageEvent) => void): void
	removeEventListener(e: "message", listener: (event: MessageEvent) => void): void
}

export type MessagePortal = {
	postMessage(m: any, transfer?: Transferable[]): void
} & Portal

export class Messenger<xRemoteFns extends Fns> {
	static forWindow<R extends Fns>(w: Window, targetOrigin: string, options: MessengerOptions<R>) {
		const messenger = new Messenger(options)
		messenger.onSendRequest((m, transfer) => w.postMessage(m, targetOrigin, transfer))
		messenger.onSendResponse((m, transfer) => w.postMessage(m, targetOrigin, transfer))
		const detach = this.#onMessage(w, e => messenger.recv(e.data))
		return [messenger, detach] as [Messenger<R>, () => void]
	}

	static forBroadcastChannel<R extends Fns>(channel: BroadcastChannel, options: MessengerOptions<R>) {
		const messenger = new Messenger(options)
		messenger.onSendRequest(m => channel.postMessage(m))
		messenger.onSendResponse(m => channel.postMessage(m))
		const detach = this.#onMessage(channel, e => messenger.recv(e.data))
		return [messenger, detach] as [Messenger<R>, () => void]
	}

	static forChannel<R extends Fns>(channel: MessagePortal, options: MessengerOptions<R>) {
		const messenger = new Messenger(options)
		messenger.onSendRequest((m, transfer) => channel.postMessage(m, transfer))
		messenger.onSendResponse((m, transfer) => channel.postMessage(m, transfer))
		const detach = this.#onMessage(channel, e => messenger.recv(e.data))
		return [messenger, detach] as [Messenger<R>, () => void]
	}

	static #onMessage(portal: Portal, fn: (e: MessageEvent) => void) {
		portal.addEventListener("message", fn)
		return () => portal.removeEventListener("message", fn)
	}

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
}

