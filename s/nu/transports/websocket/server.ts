
import {Api} from "../../core/api.js"
import {HttpHeaders, Logger} from "../../core/types.js"

/////////////////////////////////////////////////

type Options = {
	port: number
	timeout: number
	exposeErrors: boolean
	maxPayloadSize: number
	logger?: Logger
	acceptConnection({}: WebSocketConnection): SocketHandling
}

/////////////////////////////////////////////////

export class WebSocketServer {
	constructor(private options: Options) {}
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

