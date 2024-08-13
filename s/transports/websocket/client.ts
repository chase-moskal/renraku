
import {Api} from "../../core/api.js"
import {Remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {Logger} from "../../tools/logging/logger.js"
import {connectWebSocket} from "./utils/connect-web-socket.js"
import {Endpoint, GetServices, RemoteConfig} from "../../core/types.js"

type Preparations<A extends Api> = {
	socket: WebSocket
	timeout: number
	remoteConfig: RemoteConfig<GetServices<A>>
}

type Options = {
	logger: Logger
	socket: WebSocket
	socketry: Socketry
	closed(): void
	localEndpoint: Endpoint
}

// export async function webSocketClient<A extends Api>({
// 		url,
// 		timeout,
// 		remoteConfig,
// 	}: Options<A>) {
//
// 	const socket = await connectWebSocket(url)
//
// 	const socketry = new Socketry({
// 		timeout,
// 		send: data => socket.send(data),
// 	})
//
// 	const remote = new Remote(
// 		socketry.remoteEndpoint,
// 		remoteConfig,
// 	)
//
// 	return {
// 		remote,
// 		socketry,
// 		// applyToSocket(localEndpoint: Endpoint) {
// 		// 	socketry.applyToSocket(socket, {
// 		// 		logger,
// 		// 		headers: {},
// 		// 		exposeErrors: true,
// 		// 		closed,
// 		// 		localEndpoint,
// 		// 	})
// 		// },
// 	}
// }

export class WebSocketClient<A extends Api> extends Remote<A> {
	static connect = connectWebSocket
	socketry: Socketry

	constructor(public options: {
			timeout: number
			socket: WebSocket
			remoteConfig: RemoteConfig<GetServices<A>>
		}) {

		const socketry = new Socketry({
			timeout: options.timeout,
			send: data => options.socket.send(data),
		})

		super(socketry.remoteEndpoint, options.remoteConfig)
		this.socketry = socketry
	}

	attachLocalEndpoint(localEndpoint: Endpoint) {
		const {options, socketry} = this
		socketry.applyToSocket(socket, {
			logger,
			headers: {},
			exposeErrors: true,
			closed,
			localEndpoint,
		})
	}
}

// export class WebSocketClient {
// 	static connect = connectWebSocket
//
// 	static async prepare<A extends Api>({
// 			socket,
// 			timeout,
// 			remoteConfig,
// 		}: Preparations<A>) {
//
// 		const socketry = new Socketry({
// 			timeout,
// 			send: data => socket.send(data),
// 		})
//
// 		const remote = new Remote(
// 			socketry.remoteEndpoint,
// 			remoteConfig,
// 		)
//
// 		return {remote, socket, socketry}
// 	}
//
// 	constructor(private options: Options) {
// 		const {
// 			socket,
// 			socketry,
// 			logger,
// 			closed,
// 			localEndpoint,
// 		} = options
//
// 		socketry.applyToSocket(socket, {
// 			logger,
// 			headers: {},
// 			exposeErrors: true,
// 			closed,
// 			localEndpoint,
// 		})
// 	}
//
// 	close() {
// 		this.options.socket.close()
// 	}
// }
//
//
//
// export class WebSocketClient<A extends Api> {
// 	static async connect<A extends Api>(
// 			url: string,
// 			options: WebSocketClientOptions<A>,
// 		) {
// 		return new this(await connectWebSocket(url), options)
// 	}
//
// 	remote: Remote<A>
//
// 	constructor(
// 			public socket: WebSocket,
// 			public options: WebSocketClientOptions<A>,
// 		) {
//
// 		const {logger, timeout, remoteConfig, closed, setupLocalEndpoint} = options
//
// 		const socketry = new Socketry({
// 			timeout,
// 			send: data => socket.send(data),
// 		})
//
// 		const remote = this.remote = new Remote(
// 			socketry.remoteEndpoint,
// 			remoteConfig,
// 		)
//
// 		socketry.applyToSocket(socket, {
// 			logger,
// 			headers: {},
// 			exposeErrors: true,
// 			closed,
// 			localEndpoint: setupLocalEndpoint(remote),
// 		})
// 	}
//
// 	get fns() {
// 		return this.remote.fns
// 	}
//
// 	close() {
// 		this.socket.close()
// 	}
// }

