
import * as ws from "ws"
import * as http from "http"

import {Api} from "../../core/api.js"
import {HttpHeaders, Logger} from "../../core/types.js"

/////////////////////////////////////////////////

type Options = {
	port: number
	logger: Logger
	timeout: number
	exposeErrors: boolean
	maxPayloadSize: number
	acceptConnection({}: WebSocketConnection): SocketHandling
}

/////////////////////////////////////////////////

export class WebSocketServer {
	wsServer: ws.Server
	httpServer: http.Server

	constructor(private options: Options) {
		const httpServer = this.httpServer = http.createServer()

		const wsServer = this.wsServer = new ws.WebSocketServer({
			noServer: true,
			maxPayload: options.maxPayloadSize,
		})

		wsServer
			.on("error", this.#log_error)
			.on("connection", this.#handle_websocket_connection)

		httpServer
			.on("error", this.#log_error)
			// .prependListener("request", healthCheck("/health"), options.logger, () => {})
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
			.listen(options.port)

		options.logger.log(`💡 started web socket server ${options.port}`)
	}

	#log_error = (err: Error) => {
		this.options.logger.error(`${err.name}: ${err.message}`)
	}

	#count = 1

	#handle_websocket_connection = async(socket: ws.WebSocket, req: http.IncomingMessage) => {
		const {logger, timeout, exposeErrors} = this.options
		const clientCount = this.#count++
		logger.log(`📖 connected ${clientCount}`)
		const logDisconnect = () => logger.log(`📕 disconnected ${clientCount}`)

		// const {startWaitingForResponse, acceptIncoming} = negotiator({
		// 	logger,
		// 	timeout,
		// 	exposeErrors,
		// })
		// const {api, handleConnectionClosed} = acceptConnection({
		// 	headers: req.headers,
		// 	controls: {
		// 		ping() {
		// 			socket.ping()
		// 		},
		// 		close() {
		// 			socket.close()
		// 			handleConnectionClosed()
		// 			logDisconnect()
		// 		},
		// 	},
		// 	prepareClientApi(map) {
		// 		const requester: Servelet = async({meta, method, params}) => {
		// 			const {id, response} = startWaitingForResponse()
		// 			socket.send(JSON.stringify(<JsonRpcRequestWithMeta>{
		// 				id,
		// 				jsonrpc: "2.0",
		// 				meta,
		// 				method,
		// 				params,
		// 			}))
		// 			logger.log(`🔺 ${method}()`)
		// 			return response
		// 		}
		// 		return remote(requester, map)
		// 	},
		// })
		// const serversideServelet = servelet(api)
		// socket.onclose = () => {
		// 	handleConnectionClosed()
		// 	logDisconnect()
		// }
		// socket.onerror = event => {
		// 	logger.error(`🚨 socket error`, event.message, event.error)
		// 	socket.close()
		// 	handleConnectionClosed()
		// 	logDisconnect()
		// }
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

/////////////////////////////////////////////////

export interface SocketHandling {
	serverApi: Api<any>
	handleConnectionClosed(): void
}

export type WebSocketConnection = {
	headers: HttpHeaders
	ping(): void
	close(): void
}

