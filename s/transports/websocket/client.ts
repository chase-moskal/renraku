
import {remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {Api, Endpoint, GetFns} from "../../core/types.js"
import {makeWebSocket} from "./utils/connect-web-socket.js"

type Options<A extends Api> = {
	url: string
	timeout: number
	exposeErrors: boolean
	getLocalEndpoint: (remote: GetFns<A>) => Endpoint | null | undefined | void
}

export async function webSocketRemote<A extends Api>(options: Options<A>) {
	const {url, timeout, exposeErrors, getLocalEndpoint} = options
	const {socket, ready} = makeWebSocket(url)

	const socketry = new Socketry({
		socket,
		timeout,
		headers: {},
		exposeErrors,
	})

	const fns = remote<A>(socketry.remoteEndpoint)

	socket.onmessage = socketry.prepareMessageHandler(
		getLocalEndpoint(fns) ?? null
	)

	await ready
	return {socket, remote: fns}
}

