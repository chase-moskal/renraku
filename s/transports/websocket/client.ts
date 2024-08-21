
import {remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {deadline} from "../../tools/deadline.js"
import {Endpoint, Fns} from "../../core/types.js"

type Requirements = {
	url: string
}

type Options<F extends Fns> = {
	timeout: number
	getLocalEndpoint: (remote: F) => Endpoint | null
}

export async function webSocketRemote<F extends Fns>(params: Requirements & Partial<Options<F>>) {
	const {
		url,
		timeout = 10_000,
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
			headers: {},
		})

		const fns = remote<F>(socketry.remoteEndpoint)

		socket.onmessage = socketry.prepareMessageHandler(
			getLocalEndpoint(fns)
		)

		await ready
		return {socket, remote: fns}
	})
}

