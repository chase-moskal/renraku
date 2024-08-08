
import {Endpoint, GetServices, RemoteConfig} from "../../core/types.js"
import {Socketry} from "./utils/socketry.js"
import {Logger} from "../../tools/logging/logger.js"
import {connectWebSocket} from "./utils/connect-web-socket.js"
import {Remote} from "../../core/remote.js"
import {Api} from "../../core/api.js"

export type WebSocketClientOptions = {
	logger: Logger
	timeout: number
	endpoint: Endpoint
	closed(): void
}

export type WebSocketRemoteOptions<A extends Api> = {
	remoteConfig: RemoteConfig<GetServices<A>>
} & WebSocketClientOptions

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

export async function webSocketClient(url: string, options: WebSocketClientOptions) {
	const socket = await connectWebSocket(url)
	const {logger, timeout, endpoint, closed} = options
	const socketry = new Socketry({
		logger,
		timeout,
		localEndpoint: endpoint,
		send: data => socket.send(data),
		closed: () => closed(),
	})
	socket.onclose = socketry.onclose
	socket.onerror = socketry.onerror
	socket.onmessage = socketry.onmessage
	const {remoteEndpoint} = socketry
	return {socket, remoteEndpoint}
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

export class WebSocketRemote<A extends Api> extends Remote<A> {
	static async connect<A extends Api>(
			url: string,
			options: WebSocketRemoteOptions<A>,
		) {
		const {socket, remoteEndpoint} = await webSocketClient(url, options)
		return new this(socket, remoteEndpoint, options.remoteConfig)
	}

	constructor(
			public socket: WebSocket,
			endpoint: Endpoint,
			config: RemoteConfig<GetServices<A>>,
		) {
		super(endpoint, config)
	}

	close() {
		this.socket.close()
	}
}

