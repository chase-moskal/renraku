
import * as ws from "ws"
import * as http from "http"

import {Socketry} from "./utils/socketry.js"
import {Logger} from "../../tools/logging/logger.js"
import {errorString} from "../../tools/error-string.js"
import {Endpoint, HttpHeaders} from "../../core/types.js"
import {PrettyLogger} from "../../tools/logging/pretty-logger.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

type Options = {
	logger: Logger
	timeout: number
	exposeErrors: boolean
	maxPayloadSize: number
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
			logger: new PrettyLogger(),
			timeout: 10_000,
			exposeErrors: false,
			maxPayloadSize: 10_000_000,
			...inputs,
		}

		const httpServer = this.httpServer = http.createServer()
		this.listen = httpServer.listen.bind(httpServer)

		const wsServer = this.wsServer = new ws.WebSocketServer({
			noServer: true,
			maxPayload: params.maxPayloadSize,
		})

		wsServer
			.on("error", this.#log_error)
			.on("connection", this.#handle_websocket_connection)

		httpServer
			.on("error", this.#log_error)
			.on("request", allowCors(
				healthCheck("/health", params.logger, () => {})
			))
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
	}

	#log_error = (err: Error) => {
		this.params.logger.error(`${err.name}: ${err.message}`)
	}

	#count = 1

	#handle_websocket_connection = async(
			socket: ws.WebSocket,
			req: http.IncomingMessage,
		) => {

		const {logger, timeout, exposeErrors, acceptConnection} = this.params
		const clientCount = this.#count++

		logger.log(`📖 connected ${clientCount}`)
		const logDisconnect = () => logger.log(`📕 disconnected ${clientCount}`)

		const socketry = new Socketry({
			timeout,
			socket,
			exposeErrors,
			headers: req.headers,
		})

		const {localEndpoint, closed} = acceptConnection({
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

		socket.onmessage = socketry.prepareMessageHandler(localEndpoint)

		socket.onerror = err => {
			errorString("socket client", err.message)
		}

		socket.onclose = () => {
			logDisconnect()
			closed()
		}
	}

	close() {
		this.wsServer.close()
		this.httpServer.close()
		this.params.logger.log(`🛑 stopped web socket server`)
	}
}

