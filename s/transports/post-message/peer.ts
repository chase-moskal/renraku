
import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {remote} from "../../core/remote.js"
import {endpoint} from "../../core/endpoint.js"
import {Remote} from "../../core/remote-proxy.js"
import {Bidirectional} from "../utils/bidirectional.js"

export type PostMessageLocal<R extends Fns> = {
	getFns: (event: MessageEvent, remote: Remote<R>) => (Fns | null)
	window: {
		addEventListener: (e: "message", listener: (event: MessageEvent) => void) => void
		removeEventListener: (e: "message", listener: (event: MessageEvent) => void) => void
	}
}

export type PostMessageRemote = {
	getOrigin: () => string
	window: {
		postMessage: (message: any, origin: string) => void
	}
}

export type PostMessagePeerOptions<R extends Fns> = {
	timeout?: number
	onError?: (error: any) => void
	local: PostMessageLocal<R>
	remote: PostMessageRemote
}

export class PostMessagePeer<R extends Fns> {
	bidirectional: Bidirectional
	remote: Remote<R>
	dispose = () => {}

	constructor(options: PostMessagePeerOptions<R>) {
		const onError = options.onError ?? (err => console.error(err))

		this.bidirectional = new Bidirectional({
			onError,
			timeout: options.timeout ?? defaults.timeout,
			onSend: outgoing => {
				options.remote.window.postMessage(outgoing, options.remote.getOrigin())
			},
		})

		this.remote = remote<R>(this.bidirectional.remoteEndpoint)

		const listener = (event: MessageEvent) => {
			const fns = options.local.getFns(event, this.remote)
			const localEndpoint = fns ? endpoint(fns) : null
			this.bidirectional.receive(localEndpoint, event.data)
				.catch(onError)
		}

		options.local.window.addEventListener("message", listener)
		this.dispose = () => options.local.window.removeEventListener("message", listener)
	}
}

