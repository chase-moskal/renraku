
import {Rig} from "./messenger.js"
import {pubsub} from "../../tools/pubsub.js"
import {JsonRpc} from "../../comms/json-rpc.js"

export type PortalChannel = {
	addEventListener(e: "message", listener: (event: MessageEvent) => void): void
	removeEventListener(e: "message", listener: (event: MessageEvent) => void): void
}

export type MessageListener = (e: MessageEvent) => void

export abstract class Portal {
	static attach(channel: PortalChannel, fn: MessageListener) {
		channel.addEventListener("message", fn)
		return () => channel.removeEventListener("message", fn)
	}
	onMessage = pubsub<[MessageEvent<JsonRpc.Bidirectional>]>()
	dispose() { this.onMessage.clear() }
	abstract sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined, done: Promise<JsonRpc.Respondish | null>): void
	abstract sendResponse(message: JsonRpc.Respondish, rig: Rig): void
}

export class WindowPortal extends Portal {
	#cleanup: () => void

	constructor(public channel: Window, public targetOrigin: string, listener = (e: MessageEvent) => this.onMessage.publish(e)) {
		super()
		this.#cleanup = Portal.attach(channel, listener)
	}

	sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined) {
		this.channel.postMessage(message, this.targetOrigin, transfer)
	}

	sendResponse(message: JsonRpc.Respondish, rig: Rig) {
		this.channel.postMessage(message, this.targetOrigin, rig.transfer)
	}

	dispose() {
		super.dispose()
		this.#cleanup()
	}
}

export class BroadcastPortal extends Portal {
	#cleanup: () => void

	constructor(public channel: BroadcastChannel, listener = (e: MessageEvent) => this.onMessage.publish(e)) {
		super()
		this.#cleanup = Portal.attach(channel, listener)
	}

	sendRequest(message: JsonRpc.Requestish, _transfer: Transferable[] | undefined) {
		this.channel.postMessage(message)
	}

	sendResponse(message: JsonRpc.Respondish, _transfer: Rig) {
		this.channel.postMessage(message)
	}

	dispose() {
		super.dispose()
		this.#cleanup()
	}
}

export type MessagePortalChannel = {
	postMessage(message: JsonRpc.Bidirectional, transfer: Transferable[] | undefined): void
} & PortalChannel

export class MessagePortal extends Portal {
	#cleanup: () => void

	constructor(public channel: MessagePortalChannel, listener = (e: MessageEvent) => this.onMessage.publish(e)) {
		super()
		this.#cleanup = Portal.attach(channel, listener)
	}

	sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined) {
		this.channel.postMessage(message, transfer)
	}

	sendResponse(message: JsonRpc.Respondish, rig: Rig) {
		this.channel.postMessage(message, rig.transfer)
	}

	dispose() {
		super.dispose()
		this.#cleanup()
	}
}

