
import {Socketry} from "./utils/socketry.js"
import {deadline} from "../../tools/deadline.js"
import {Endpoint, Fns} from "../../core/types.js"
import {loggers} from "../../tools/logging/loggers.js"
import {remote, RemoteOptions} from "../../core/remote.js"

type Options<F extends Fns> = {
	url: string
	onClose: () => void
	timeout?: number
	onError?: (error: any) => void
	getLocalEndpoint?: (remote: F) => Endpoint | null
} & RemoteOptions

export async function webSocketRemote<F extends Fns>(
		params: Options<F>
	) {

	const {
		url,
		onClose,
		timeout = 10_000,
		onError = loggers.onError,
		getLocalEndpoint = () => null,
	} = params

	return await deadline(timeout, async() => {
		const socket = new WebSocket(url)

		const ready = new Promise<WebSocket>((resolve, reject) => {
			socket.onopen = () => resolve(socket)
			socket.onerror = () => reject(new Error(`websocket connection failed "${url}"`))
		})

		const socketry = new Socketry({
			socket,
			timeout,
			onError,
		})

		const fns = remote<F>(socketry.remoteEndpoint, params)

		socket.onclose = () => onClose()
		socket.onmessage = event => socketry.receive(
			getLocalEndpoint(fns as F),
			event,
		)

		await ready
		return {socket, fns}
	})
}

