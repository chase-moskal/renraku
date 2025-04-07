
import {PortalChannel} from "./types.js"

export abstract class BasePortal {
	abstract channel: PortalChannel
	abstract send(message: any, transfer?: Transferable[]): void
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
		public channel: {
			postMessage(message: any, transfer?: Transferable[]): void
		} & PortalChannel
	) { super() }

	send(message: any, transfer?: Transferable[]) {
		this.channel.postMessage(message, transfer)
	}
}

