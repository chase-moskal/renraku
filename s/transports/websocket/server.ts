
import * as ws from "ws"
import * as http from "http"

import {Socketry} from "./utils/socketry.js"
import {Endpoint, HttpHeaders} from "../../core/types.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

type Options = {
	timeout: number
	maxPayloadSize: number
	onError: (error: any) => void
}

type Requirements = {
	acceptConnection({}: Connection): Handling
}

type Handling = {
	closed: () => void
	localEndpoint: Endpoint | null
}

type Connection = {
	headers: HttpHeaders
	ping: () => void
	close: () => void
	remoteEndpoint: Endpoint
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

export class WebSocketServer {
	params: Options & Requirements
	wsServer: ws.WebSocketServer
	httpServer: http.Server

	listen: http.Server["listen"]

	constructor(inputs: Partial<Options> & Requirements) {
		const params = this.params = {
			timeout: 10_000,
			maxPayloadSize: 10_000_000,
			onError: () => {},
			...inputs,
		}

		const httpServer = this.httpServer = http.createServer()
		this.listen = httpServer.listen.bind(httpServer)

		const wsServer = this.wsServer = new ws.WebSocketServer({
			noServer: true,
			maxPayload: params.maxPayloadSize,
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

		const socketry = new Socketry({
			socket,
			timeout,
			headers: req.headers,
			onError,
		})

		const {localEndpoint, closed} = acceptConnection({
			headers: req.headers,
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
		socket.onmessage = socketry.prepareMessageHandler(localEndpoint)
	}

	close() {
		this.wsServer.close()
		this.httpServer.close()
	}
}

