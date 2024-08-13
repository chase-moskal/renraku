
import {Api} from "../../core/api.js"
import {Remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {GetServices, RemoteConfig} from "../../core/types.js"
import {connectWebSocket} from "./utils/connect-web-socket.js"

export type WebSocketClientOptions<A extends Api> = {
	timeout: number
	socket: WebSocket
	exposeErrors: boolean
	remoteConfig: RemoteConfig<GetServices<A>>
}

export class WebSocketRemote<A extends Api> extends Remote<A> {
	static connect = connectWebSocket
	socketry: Socketry

	constructor(public options: WebSocketClientOptions<A>) {
		const {timeout, socket, exposeErrors} = options

		const socketry = new Socketry({
			socket,
			timeout,
			headers: {},
			exposeErrors,
		})

		super(socketry.remoteEndpoint, options.remoteConfig)
		this.socketry = socketry
	}

	get socket() {
		return this.options.socket
	}

	attachClientside(api: Api) {
		const {socketry, options: {socket}} = this
		socket.onmessage = socketry.prepareMessageHandler(api.endpoint)
		return this
	}

	close() {
		this.options.socket.close()
	}
}

