
import * as ws from "ws"
import * as http from "http"

import {Socketry} from "./utils/socketry.js"
import {Endpoint, HttpHeaders} from "../../core/types.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {EndpointListenerOptions} from "../http/node-utils/endpoint-listener.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

/////////////////////////////////////////////////

export type WebSocketServerOptions = {
	timeout: number
	acceptConnection({}: WebSocketConnection): SocketHandling
} & EndpointListenerOptions

export interface SocketHandling {
	closed: () => void
	localEndpoint: Endpoint
}

export type WebSocketConnection = {
	headers: HttpHeaders
	ping: () => void
	close: () => void
	remoteEndpoint: Endpoint
}

/////////////////////////////////////////////////

export class WebSocketServer {
	wsServer: ws.WebSocketServer
	httpServer: http.Server

	listen: http.Server["listen"]

	constructor(private options: WebSocketServerOptions) {
		const httpServer = this.httpServer = http.createServer()
		this.listen = httpServer.listen.bind(httpServer)

		const wsServer = this.wsServer = new ws.WebSocketServer({
			noServer: true,
			maxPayload: options.maxPayloadSize,
		})

		wsServer
			.on("error", this.#log_error)
			.on("connection", this.#handle_websocket_connection)

		httpServer
			.on("error", this.#log_error)
			.on("request", allowCors(
				healthCheck("/health", options.logger, () => {})
			))
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
	}

	#log_error = (err: Error) => {
		this.options.logger.error(`${err.name}: ${err.message}`)
	}

	#count = 1

	#handle_websocket_connection = async(
			socket: ws.WebSocket,
			req: http.IncomingMessage,
		) => {

		const {logger, timeout, endpoint, acceptConnection} = this.options
		const clientCount = this.#count++

		logger.log(`📖 connected ${clientCount}`)
		const logDisconnect = () => logger.log(`📕 disconnected ${clientCount}`)

		const socketry = new Socketry({
			logger,
			timeout,
			localEndpoint: endpoint,
			closed: () => closed(),
			send: data => socket.send(data),
		})

		socket.onerror = socketry.onerror
		socket.onclose = socketry.onclose
		socket.onmessage = socketry.onmessage

		const {closed} = acceptConnection({
			headers: req.headers,
			ping: () => {
				socket.ping()
			},
			close: () => {
				socket.close()
				closed()
				logDisconnect()
			},
			remoteEndpoint: socketry.remoteEndpoint,
		})
	}

	close() {
		this.wsServer.close()
		this.httpServer.close()
		this.options.logger.log(`🛑 stopped web socket server`)
	}
}

