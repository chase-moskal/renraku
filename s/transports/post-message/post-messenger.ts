
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {endpoint} from "../../core/endpoint.js"
import {Remote} from "../../core/remote-proxy.js"
import {Loggers} from "../../tools/logging/loggers.js"
import {Bidirectional} from "../utils/bidirectional.js"
import {Fns, OnCall, OnCallError, OnError} from "../../core/types.js"

// TODO
// change getFns to getEndpoint, thus outsourcing the responsibility
// to define the endpoint options

export type PostMessengerLocal<R extends Fns> = {
	getFns: (event: MessageEvent, remote: Remote<R>) => (Fns | null)
	window: {
		addEventListener: (e: "message", listener: (event: MessageEvent) => void) => void
		removeEventListener: (e: "message", listener: (event: MessageEvent) => void) => void
	}
}

export type PostMessengerRemote = {
	getOrigin: () => string
	window: {
		postMessage: (message: any, origin: string) => void
	}
}

export type PostMessengerOptions<R extends Fns> = {
	local: PostMessengerLocal<R>
	remote: PostMessengerRemote
	timeout?: number
	onError?: OnError
	onCall?: OnCall
	onCallError?: OnCallError
}

/** @deprecated use `Messenger` instead */
export class PostMessenger<R extends Fns> {
	bidirectional: Bidirectional
	remote: Remote<R>
	dispose = () => {}

	constructor(options: PostMessengerOptions<R>) {
		const loggers = new Loggers()
		const {
			onCall = loggers.onCall,
			onError = loggers.onError,
			onCallError = loggers.onCallError,
		} = options

		this.bidirectional = new Bidirectional({
			timeout: options.timeout ?? defaults.timeout,
			onSend: outgoing => {
				options.remote.window.postMessage(
					outgoing,
					options.remote.getOrigin(),
				)
			},
		})

		this.remote = remote<R>(this.bidirectional.remoteEndpoint, {onCall})

		const listener = (event: MessageEvent) => {
			const fns = options.local.getFns(event, this.remote)
			const localEndpoint = fns ? endpoint(fns, {onCall, onCallError}) : null
			this.bidirectional.receive(localEndpoint, event.data)
				.catch(onError)
		}

		options.local.window.addEventListener("message", listener)
		this.dispose = () => options.local.window.removeEventListener("message", listener)
	}
}

