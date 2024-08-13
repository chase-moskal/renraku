
import {Api} from "../../core/api.js"
import {Remote} from "../../core/remote.js"
import {Socketry} from "./utils/socketry.js"
import {makeWebSocket} from "./utils/connect-web-socket.js"
import {GetServices, RemoteConfig} from "../../core/types.js"

type Options<A extends Api> = {
	url: string
	timeout: number
	exposeErrors: boolean
	remoteConfig: RemoteConfig<GetServices<A>>
}

export class WebSocketRemote<A extends Api> extends Remote<A> {
	socket: WebSocket
	ready: Promise<WebSocket>
	socketry: Socketry

	constructor(public options: Options<A>) {
		const {url, timeout, exposeErrors} = options
		const {socket, ready} = makeWebSocket(url)
		const socketry = new Socketry({
			socket,
			timeout,
			headers: {},
			exposeErrors,
		})

		super(socketry.remoteEndpoint, options.remoteConfig)

		this.ready = ready
		this.socket = socket
		this.socketry = socketry
	}

	async finalize(api: Api | null) {
		const {socketry, socket} = this
		socket.onmessage = socketry.prepareMessageHandler(api?.endpoint ?? null)
		socket.onclose = () => console.log("disconnected")
		await this.ready
		return this
	}

	close() {
		this.socket.close()
	}
}

