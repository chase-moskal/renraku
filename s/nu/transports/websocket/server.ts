
import * as ws from "ws"
import * as http from "http"

import {Api} from "../../core/api.js"
import {Endpoint, HttpHeaders} from "../../core/types.js"
import {EndpointListenerOptions} from "../http/node-utils/endpoint-listener.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"
import {ResponseWaiter} from "./utils/response-waiter.js"
import {JsonRpc} from "../../core/json-rpc.js"

/////////////////////////////////////////////////

export type WebSocketServerOptions = {
	timeout: number
	endpoint: Endpoint
	acceptConnection({}: WebSocketConnection): SocketHandling
} & EndpointListenerOptions

export interface SocketHandling {
	serverApi: Api<any>
	handleConnectionClosed: () => void
}

export type WebSocketConnection = {
	headers: HttpHeaders
	ping: () => void
	close: () => void
	endpoint: Endpoint
}

/////////////////////////////////////////////////

export class WebSocketServer {
	wsServer: ws.Server
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
			.prependListener("request", allowCors(
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

		const {logger, timeout, exposeErrors, acceptConnection} = this.options
		const clientCount = this.#count++

		logger.log(`📖 connected ${clientCount}`)
		const logDisconnect = () => logger.log(`📕 disconnected ${clientCount}`)

		const waiter = new ResponseWaiter(timeout)

		const {serverApi, handleConnectionClosed} = acceptConnection({
			headers: req.headers,
			ping: () => {
				socket.ping()
			},
			close: () => {
				socket.close()
				handleConnectionClosed()
				logDisconnect()
			},
			endpoint: async request => {
				socket.send(JSON.stringify(request))
				return "id" in request
					? await waiter.wait(request.id)
					: null
			},
		})

		socket.onclose = () => {
			handleConnectionClosed()
			logDisconnect()
		}

		socket.onerror = event => {
			logger.error(`🚨 socket error`, event.message, event.error)
			socket.close()
			handleConnectionClosed()
			logDisconnect()
		}

		const handleInboundRequest = (request: JsonRpc.Request) => {
		}

		const handleInboundResponse = (response: JsonRpc.Response) => {
		}

		socket.onmessage = async event => {
			const bi: JsonRpc.Bidirectional = JSON.parse(event.data.toString())

			const array: (JsonRpc.Request | JsonRpc.Response)[] = (
				Array.isArray(bi)
					? bi
					: [bi]
			)

			for (const message of array) {
				if ("method" in message)
					handleInboundRequest(message)
				else
					handleInboundResponse(message)
			}
		}

		// socket.onmessage = async event => acceptIncoming({
		// 	servelet: serversideServelet,
		// 	headers: req.headers,
		// 	incoming: JSON.parse(event.data.toString()),
		// 	respond: response => socket.send(JSON.stringify(response)),
		// })
	}

	close() {
		this.wsServer.close()
		this.httpServer.close()
		this.options.logger.log(`🛑 stopped web socket server`)
	}
}

