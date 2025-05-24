
import {deadline} from "@e280/stz"
import {defaults} from "../defaults.js"
import {Socketry} from "./utils/socketry.js"
import {Endpoint, Fns} from "../../core/types.js"
import {remote, RemoteOptions} from "../../core/remote.js"

type Options<F extends Fns> = {
	url: string
	timeout?: number
	onClose: () => void
	getLocalEndpoint?: (remote: F) => Endpoint | null
} & Omit<RemoteOptions, "endpoint">

export async function webSocketRemote<F extends Fns>(params: Options<F>) {
	const {
		url,
		tap,
		timeout = defaults.timeout,
		onClose,
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
			tap,
		})

		const r = remote<F>({...params, endpoint: socketry.remoteEndpoint})
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

