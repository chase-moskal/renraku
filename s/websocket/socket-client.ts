
import {servelet} from "../servelet.js"
import {remote} from "../general/remote.js"
import {negotiator} from "./negotiator/negotiator.js"
import {noLogger} from "../tools/fancy-logging/no-logger.js"
import {Api, ApiRemote, JsonRpcRequestWithMeta, MetaMap, Servelet} from "../types.js"

export async function webSocketClient<xServerApi extends Api>({
		link, timeout, serverMetas, clientApi, handleConnectionClosed,
	}: {
		link: string
		timeout: number,
		serverMetas: MetaMap<xServerApi>
		clientApi: (serverRemote: ApiRemote<xServerApi>) => Api
		handleConnectionClosed(): void
	}) {

	const socket = await connectWebSocket(link)
	const {startWaitingForResponse, acceptIncoming} = negotiator({
		timeout,
		exposeErrors: true,
		logger: noLogger(),
	})

	const requester: Servelet = async({meta, method, params}) => {
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
	const serverRemote = remote(requester, serverMetas)

	socket.onclose = () => handleConnectionClosed()
	socket.onerror = event => {
		console.error("socket error", event)
		socket.close()
		handleConnectionClosed()
	}
	socket.onmessage = async event => acceptIncoming({
		servelet: servelet(clientApi(serverRemote)),
		headers: undefined,
		incoming: JSON.parse(event.data.toString()),
		respond: response => socket.send(JSON.stringify(response)),
	})

	return {
		remote: serverRemote,
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
