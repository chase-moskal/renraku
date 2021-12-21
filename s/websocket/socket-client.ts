
import {servelet} from "../servelet.js"
import {negotiator} from "./helpers/negotiator.js"
import {remoteWithMetaMap} from "../http/mapping/remote-with-meta-map.js"
import {Api, JsonRpcRequestWithMeta, MetaMap, Requester} from "../types.js"

export async function webSocketClient<xServerApi extends Api>({
		link, metaMap, clientApi, handleConnectionClosed,
	}: {
		link: string
		metaMap: MetaMap<xServerApi>
		clientApi: Api
		handleConnectionClosed(): void
	}) {

	const clientServelet = servelet(clientApi)
	const socket = await connectWebSocket(link)
	const {startWaitingForResponse, acceptIncoming} = negotiator()

	const requester: Requester = async({meta, method, params}) => {
		const {id, response} = startWaitingForResponse()
		socket.send(JSON.stringify(<JsonRpcRequestWithMeta>{
			jsonrpc: "2.0",
			id,
			meta,
			method,
			params,
		}))
		return response
	}

	socket.onclose = () => handleConnectionClosed()
	socket.onerror = event => {
		console.error("socket error", event)
		socket.close()
		handleConnectionClosed()
	}
	socket.onmessage = async event => acceptIncoming({
		servelet: clientServelet,
		headers: undefined,
		exposeErrors: true,
		incoming: JSON.parse(event.data.toString()),
		respond: response => socket.send(JSON.stringify(response)),
	})

	return {
		remote: remoteWithMetaMap(requester, metaMap),
		close: () => socket.close(),
	}
}

async function connectWebSocket(link: string) {
	return new Promise<WebSocket>((resolve, reject) => {
		const socket = new WebSocket(link)
		socket.onopen = () => resolve(socket)
		socket.onerror = error => reject(error)
	})
}
