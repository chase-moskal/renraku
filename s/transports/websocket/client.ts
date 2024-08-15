
import {remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {Api, Endpoint, GetFns} from "../../core/types.js"

type Options<A extends Api> = {
	url: string
	timeout?: number
	exposeErrors?: boolean
	getLocalEndpoint?: (remote: GetFns<A>) => Endpoint | null
}

export async function webSocketRemote<A extends Api>(options: Options<A>) {
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

	const fns = remote<A>(socketry.remoteEndpoint)

	socket.onmessage = socketry.prepareMessageHandler(
		getLocalEndpoint(fns)
	)

	await ready
	return {socket, remote: fns}
}

