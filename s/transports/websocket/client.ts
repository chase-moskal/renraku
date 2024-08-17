
import {remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {Endpoint, Fns} from "../../core/types.js"

type Options<F extends Fns> = {
	url: string
	timeout?: number
	exposeErrors?: boolean
	getLocalEndpoint?: (remote: F) => Endpoint | null
}

export async function webSocketRemote<F extends Fns>(options: Options<F>) {
	const {
		url,
		timeout = 10_000,
		exposeErrors = true,
		getLocalEndpoint = () => null,
	} = options

	const socket = new WebSocket(url)

	const ready = new Promise<WebSocket>((resolve, reject) => {
		socket.onopen = () => resolve(socket)
		socket.onerror = error => reject(error)
	})

	const socketry = new Socketry({
		socket,
		timeout,
		headers: {},
		exposeErrors,
	})

	const fns = remote<F>(socketry.remoteEndpoint)

	socket.onmessage = socketry.prepareMessageHandler(
		getLocalEndpoint(fns)
	)

	await ready
	return {socket, remote: fns}
}

