
import {PortalChannel} from "./types.js"
import {JsonRpc} from "../../comms/json-rpc.js"

export abstract class BasePortal {
	abstract channel: PortalChannel
	abstract sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined, done: Promise<JsonRpc.Respondish | null>): void
	abstract sendResponse(message: JsonRpc.Respondish, transfer: Transferable[] | undefined, portal: BasePortal): void
}

export class WindowPortal extends BasePortal {
	constructor(public channel: Window, public targetOrigin: string) { super() }
	sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined) {
		this.channel.postMessage(message, this.targetOrigin, transfer)
	}
	sendResponse(message: JsonRpc.Respondish, transfer: Transferable[] | undefined) {
		this.channel.postMessage(message, this.targetOrigin, transfer)
	}
}

export class BroadcastPortal extends BasePortal {
	constructor(public channel: BroadcastChannel) { super() }
	sendRequest(message: JsonRpc.Requestish, _transfer: Transferable[] | undefined) {
		this.channel.postMessage(message)
	}
	sendResponse(message: JsonRpc.Respondish, _transfer: Transferable[] | undefined) {
		this.channel.postMessage(message)
	}
}

export class MessagePortal extends BasePortal {
	constructor(
		public channel: {
			postMessage(message: JsonRpc.Bidirectional, transfer?: Transferable[]): void
		} & PortalChannel
	) { super() }

	sendRequest(message: JsonRpc.Requestish, transfer?: Transferable[]) {
		this.channel.postMessage(message, transfer)
	}

	sendResponse(message: JsonRpc.Respondish, transfer?: Transferable[]) {
		this.channel.postMessage(message, transfer)
	}
}

