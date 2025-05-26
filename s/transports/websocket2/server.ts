
import * as ws from "ws"
import * as http from "http"
import {sub} from "@e280/stz"

import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {Ws, WsOptions} from "./types.js"
import {keepAlive} from "./utils/keep-alive.js"
import {endpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {ipAddress} from "../../tools/ip-address.js"
import {WebSocketConduit} from "../messenger/index.js"
import {simplifyHeaders} from "../../tools/simple-headers.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

export function webSocketServer<ClientFns extends Fns>(
		options: WsOptions<ClientFns>
	) {

	const timeout = options.timeout ?? defaults.timeout
	const maxPayload = options.maxRequestBytes ?? defaults.maxRequestBytes
	const onError = options.tap?.error ?? (() => {})

	const httpServer = http.createServer()
	const wsServer = new ws.WebSocketServer({noServer: true, maxPayload})

	async function acceptConnection(
			socket: ws.WebSocket,
			req: http.IncomingMessage,
		) {

		const ip = ipAddress(req)
		const headers = simplifyHeaders(req.headers)
		const onClosed = sub()
		const taps = options.tap?.webSocket({ip, headers, req})

		const stop = keepAlive({
			socket,
			timeout,
			heartbeat: timeout === Infinity
				? 20_000
				: (timeout * (2 / 3)),
			onTimeout: () => {
				onClosed.pub()
				taps?.remote?.error(new Error("timed out"))
			},
		})

		socket.onerror = error => {
			stop()
			socket.close()
			onError(error)
			onClosed.pub()
		}

		socket.onclose = () => {
			stop()
			onClosed.pub()
		}

		const messenger = new Messenger<ClientFns>({
			tap: taps?.remote,
			timeout: options.timeout,
			conduit: new WebSocketConduit(socket),
			getLocalEndpoint: () => endpoint({
				tap: taps?.local,
				fns: serversideFns,
			}),
		})

		const serversideFns = await options.accept({
			ip,
			req,
			headers,
			onClosed,
			clientside: messenger.remote,
			ping: () => socket.ping(),
			close: () => {
				stop()
				socket.close()
			},
		})
	}

	return new Promise<Ws>((resolve, reject) => {
		const handleError = (error: Error) => {
			onError(error)
			reject(error)
		}

		wsServer
			.on("error", handleError)
			.on("connection", acceptConnection)

		httpServer
			.on("error", handleError)
			.on("request", allowCors(healthCheck("/health")))
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
			.listen(options.port, () => resolve({
				close: () => {
					wsServer.close()
					httpServer.close()
				},
			}))
	})
}

