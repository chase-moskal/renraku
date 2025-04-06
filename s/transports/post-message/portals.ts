
import {MessageBindables} from "./types.js"

export abstract class BasePortal {
	abstract channel: MessageBindables
	abstract postMessage(message: any, targetOrigin: string, transfer?: Transferable[]): void

	addEventListener(e: "message", listener: (event: MessageEvent) => void) {
		this.channel.addEventListener(e, listener)
	}

	removeEventListener(e: "message", listener: (event: MessageEvent) => void) {
		this.channel.removeEventListener(e, listener)
	}
}

export class WindowPortal extends BasePortal {
	constructor(public channel: Window) { super() }
	postMessage(message: any, targetOrigin: string, transfer?: Transferable[]) {
		this.channel.postMessage(message, targetOrigin, transfer)
	}
}

export class BroadcastPortal extends BasePortal {
	constructor(public channel: BroadcastChannel) { super() }
	postMessage(message: any, _targetOrigin: string, _transfer?: Transferable[]) {
		this.channel.postMessage(message)
	}
}

export class MessagePortal extends BasePortal {
	constructor(
		public channel: MessageBindables & {
			postMessage(message: any, transfer?: Transferable[]): void
		}
	) { super() }

	postMessage(message: any, _targetOrigin: string, transfer?: Transferable[]) {
		this.channel.postMessage(message, transfer)
	}
}

