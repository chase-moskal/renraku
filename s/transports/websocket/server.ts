
import * as ws from "ws"
import * as http from "http"

import {defaults} from "../defaults.js"
import {Socketry} from "./utils/socketry.js"
import {ipAddress} from "../../tools/ip-address.js"
import {Endpoint, ServerMeta} from "../../core/types.js"
import {defaultLoggers} from "../../tools/logging/loggers.js"
import {simplifyHeaders} from "../../tools/simple-headers.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

type Options = {
	timeout: number
	maxRequestBytes: number
	onError: (error: any) => void
}

type Requirements = {
	acceptConnection({}: Connection): Promise<Handling>
}

type Handling = {
	closed: () => void
	localEndpoint: Endpoint | null
}

type Connection = {
	ping: () => void
	close: () => void
	remoteEndpoint: Endpoint
} & ServerMeta

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

export class WebSocketServer {
	params: Options & Requirements
	wsServer: ws.WebSocketServer
	httpServer: http.Server

	listen: http.Server["listen"]

	constructor(inputs: Partial<Options> & Requirements) {
		const params = this.params = {
			timeout: defaults.timeout,
			maxRequestBytes: defaults.maxRequestBytes,
			onError: defaultLoggers.onError,
			...inputs,
		}

		const httpServer = this.httpServer = http.createServer()
		this.listen = httpServer.listen.bind(httpServer)

		const wsServer = this.wsServer = new ws.WebSocketServer({
			noServer: true,
			maxPayload: params.maxRequestBytes,
		})

		wsServer
			.on("error", params.onError)
			.on("connection", this.#handle_websocket_connection)

		httpServer
			.on("error", params.onError)
			.on("request", allowCors(healthCheck("/health")))
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
	}

	#handle_websocket_connection = async(
			socket: ws.WebSocket,
			req: http.IncomingMessage,
		) => {

		const {timeout, acceptConnection, onError} = this.params
		const ip = ipAddress(req)
		const headers = simplifyHeaders(req.headers)

		const socketry = new Socketry({
			socket,
			timeout,
			onError,
		})

		const {localEndpoint, closed} = await acceptConnection({
			req,
			ip,
			headers,
			ping: () => {
				socket.ping()
			},
			close: () => {
				socket.close()
				closed()
			},
			remoteEndpoint: socketry.remoteEndpoint,
		})

		socket.onerror = onError
		socket.onclose = closed
		socket.onmessage = event => socketry.receive(localEndpoint, event)
	}

	close() {
		this.wsServer.close()
		this.httpServer.close()
	}
}

