
import {WebSocketServer} from "ws"

import {renrakuServelet} from "../servelet.js"
import {negotiator} from "./helpers/negotiator.js"
import {remoteWithMetaMap} from "../http/mapping/remote-with-meta-map.js"
import {Api, ApiRemote, JsonRpcRequestWithMeta, RenrakuMetaMap, RenrakuConnectionControls, Requester} from "../types.js"

export function renrakuWebSocketServer({
		port,
		exposeErrors,
		maxPayloadSize,
		acceptConnection,
	}: {
		port: number
		maxPayloadSize: number
		exposeErrors: boolean
		acceptConnection({}: {
			controls: RenrakuConnectionControls
			prepareClientApi: <xApi extends Api>(map: RenrakuMetaMap<xApi>) => ApiRemote<xApi>,
		}): {
			api: Api
			handleConnectionClosed(): void
		}
	}) {

	const server = new WebSocketServer({
		port,
		maxPayload: maxPayloadSize,
	})

	server.on("connection", async(socket, req) => {
		const {startWaitingForResponse, acceptIncoming} = negotiator()
		const {api, handleConnectionClosed} = acceptConnection({
			controls: {
				close() {
					socket.close()
					handleConnectionClosed()
				},
			},
			prepareClientApi(map) {
				const requester: Requester = async({meta, method, params}) => {
					const {id, response} = startWaitingForResponse()
					socket.send(JSON.stringify(<JsonRpcRequestWithMeta>{
						id,
						jsonrpc: "2.0",
						meta,
						method,
						params,
					}))
					return response
				}
				return remoteWithMetaMap(requester, map)
			},
		})
		const servelet = renrakuServelet(api)
		socket.onclose = () => handleConnectionClosed()
		socket.onerror = event => {
			console.error("socket error", event.error, event.message)
			socket.close()
			handleConnectionClosed()
		}
		socket.onmessage = async event => acceptIncoming({
			servelet,
			exposeErrors,
			headers: req.headers,
			incoming: JSON.parse(event.data.toString()),
			respond: response => socket.send(JSON.stringify(response)),
		})
	})

	return {
		close: () => server.close(),
	}
}
