
import {Socketry} from "./utils/socketry.js"
import {deadline} from "../../tools/deadline.js"
import {Endpoint, Fns} from "../../core/types.js"
import {remote, RemoteOptions} from "../../core/remote.js"

type Options<F extends Fns> = {
	url: string
	timeout?: number
	onError?: (error: any) => void
	getLocalEndpoint?: (remote: F) => Endpoint | null
} & RemoteOptions

export async function webSocketRemote<F extends Fns>(
		params: Options<F>
	) {

	const {
		url,
		timeout = 10_000,
		onError = () => {},
		getLocalEndpoint = () => null,
	} = params

	return await deadline(timeout, async() => {
		const socket = new WebSocket(url)

		const ready = new Promise<WebSocket>((resolve, reject) => {
			socket.onopen = () => resolve(socket)
			socket.onerror = error => reject(error)
		})

		const socketry = new Socketry({
			socket,
			timeout,
			onError,
		})

		const fns = remote<F>(socketry.remoteEndpoint, params)

		socket.onmessage = socketry.prepareMessageHandler(
			getLocalEndpoint(fns as F)
		)

		await ready
		return {socket, fns}
	})
}

