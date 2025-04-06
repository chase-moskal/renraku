
import {Endpoint} from "../../core/types.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"

export type BidirectionalOptions = {
	timeout: number
	onSend: (outgoing: JsonRpc.Bidirectional, transfer?: Transferable[]) => void
}

export class Bidirectional {
	waiter: ResponseWaiter

	constructor(private options: BidirectionalOptions) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	remoteEndpoint: Endpoint = async(request, transfer) => {
		this.options.onSend(request, transfer)
		return "id" in request
			? await this.waiter.wait(request.id, request.method)
			: null
	}

	async receive(localEndpoint: Endpoint | null, incoming: JsonRpc.Bidirectional) {
		const {onSend} = this.options

		const processMessage = async(message: JsonRpc.Request | JsonRpc.Response) => {
			if ("method" in message) {
				if (localEndpoint)
					return await localEndpoint(message)
				else
					throw new Error(`no endpoint to call method "${message.method}"`)
			}
			else {
				this.waiter.deliverResponse(message)
			}
		}

		if (Array.isArray(incoming)) {
			const responses = (await Promise.all(incoming.map(processMessage)))
				.filter(r => !!r)
			if (responses.length > 0)
				onSend(responses)
		}
		else {
			const response = await processMessage(incoming)
			if (response)
				onSend(response)
		}
	}
}

