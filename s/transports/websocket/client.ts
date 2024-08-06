
import {Api} from "../../core/api.js"
import {connectWebSocket} from "./utils/connect-web-socket.js"
import {Endpoint, GetServices, RemoteConfig} from "../../core/types.js"

export type WebSocketClientOptions<A extends Api> = {
	serversideConfig: RemoteConfig<GetServices<A>>
	clientsideEndpoint: Endpoint
}

export class WebSocketClient<A extends Api> {
	static async connect<A extends Api>(url: string, options: WebSocketClientOptions<A>) {
		const socket = await connectWebSocket(url)
		return new this<A>(socket, options)
	}

	constructor(socket: WebSocket, private options: WebSocketClientOptions<A>) {}
}

