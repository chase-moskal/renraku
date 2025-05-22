
import {deadline} from "@e280/stz"
import {defaults} from "../defaults.js"
import {Socketry} from "./utils/socketry.js"
import {logger} from "../../tools/logger.js"
import {Endpoint, Fns} from "../../core/types.js"
import {remote, RemoteOptions} from "../../core/remote.js"

type Options<F extends Fns> = {
	url: string
	timeout?: number
	onClose: () => void
	onError?: (error: any) => void
	getLocalEndpoint?: (remote: F) => Endpoint | null
} & RemoteOptions

export async function webSocketRemote<F extends Fns>(
		params: Options<F>
	) {

	const {
		url,
		onClose,
		timeout = defaults.timeout,
		onError = logger.onError,
		getLocalEndpoint = () => null,
	} = params

	return await deadline(timeout, "web socket remote", async() => {
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

		const r = remote<F>(socketry.remoteEndpoint, params)
		const localEndpoint = getLocalEndpoint(r as F)

		socket.onclose = () => onClose()
		socket.onmessage = event => socketry.receive(
			localEndpoint,
			event,
		)

		await ready
		return {socket, remote: r}
	})
}

