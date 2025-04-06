
import {MessageBindables} from "./types.js"

export abstract class BasePortal {
	abstract channel: MessageBindables
	abstract send(message: any, transfer?: Transferable[]): void

	addEventListener(e: "message", listener: (event: MessageEvent) => void) {
		this.channel.addEventListener(e, listener)
	}

	removeEventListener(e: "message", listener: (event: MessageEvent) => void) {
		this.channel.removeEventListener(e, listener)
	}
}

export class WindowPortal extends BasePortal {
	constructor(public channel: Window, public targetOrigin: string) { super() }
	send(message: any, transfer?: Transferable[]) {
		this.channel.postMessage(message, this.targetOrigin, transfer)
	}
}

export class BroadcastPortal extends BasePortal {
	constructor(public channel: BroadcastChannel) { super() }
	send(message: any, _transfer?: Transferable[]) {
		this.channel.postMessage(message)
	}
}

export class MessagePortal extends BasePortal {
	constructor(
		public channel: MessageBindables & {
			postMessage(message: any, transfer?: Transferable[]): void
		}
	) { super() }

	send(message: any, transfer?: Transferable[]) {
		this.channel.postMessage(message, transfer)
	}
}

