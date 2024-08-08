
import {Endpoint} from "../../../core/types.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"
import {Logger} from "../../../tools/logging/logger.js"
import {errorString} from "../../../tools/error-string.js"

export type SocketryOptions = {
	logger: Logger
	timeout: number
	localEndpoint: Endpoint
	send: (data: string) => void
	closed: () => void
}

export class Socketry {
	waiter: ResponseWaiter

	constructor(private options: SocketryOptions) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	onclose = () => {
		this.options.closed()
	}

	onerror = () => {
		this.options.logger.error(errorString(null, "socket error"))
		this.options.closed()
	}

	onmessage = async(event: any) => {
		const bi: JsonRpc.Bidirectional = JSON.parse(event.data.toString())

		if (Array.isArray(bi)) {
			const responses = (await Promise.all(bi.map(this.#processMessage)))
				.filter(r => !!r)
			if (responses.length > 0)
				this.options.send(JSON.stringify(responses))
		}
		else {
			const response = await this.#processMessage(bi)
			if (response)
				this.options.send(JSON.stringify(response))
		}
	}

	remoteEndpoint: Endpoint = async request => {
		this.options.send(JSON.stringify(request))
		return "id" in request
			? await this.waiter.wait(request.id)
			: null
	}

	#processMessage = async(message: JsonRpc.Request | JsonRpc.Response) => {
		if ("method" in message)
			return await this
				.options
				.localEndpoint(message, {exposeErrors: true, headers: {}})
		else
			this.waiter.deliverResponse(message)
	}
}

