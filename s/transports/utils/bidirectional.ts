
import {defer} from "@e280/stz"

import {Endpoint} from "../../core/types.js"
import {JsonRpc} from "../../comms/json-rpc.js"
import {ResponseWaiter} from "./response-waiter.js"

export type BidirectionalOptions<R = undefined> = {
	timeout: number
	sendRequest: (request: JsonRpc.Requestish, transfer: Transferable[] | undefined, done: Promise<JsonRpc.Respondish | null>) => void
	sendResponse: (request: JsonRpc.Respondish, rig: R) => void
}

export class Bidirectional<R = undefined> {
	waiter: ResponseWaiter

	constructor(private options: BidirectionalOptions<R>) {
		this.waiter = new ResponseWaiter(this.options.timeout)
	}

	remoteEndpoint: Endpoint = async(request, {transfer} = {}) => {
		const {sendRequest} = this.options

		if ("id" in request) {
			const done = defer<JsonRpc.Respondish | null>()
			sendRequest(request, transfer, done.promise)
			return this.waiter.wait(request.id, request.method)
				.then(response => {
					done.resolve(response)
					return response
				})
		}
		else {
			const done = Promise.resolve(null)
			sendRequest(request, transfer, done)
			return done
		}
	}

	async receive(localEndpoint: Endpoint | null, incoming: JsonRpc.Bidirectional, rig: R) {
		const {sendResponse} = this.options

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
				sendResponse(responses, rig)
		}
		else {
			const response = await processMessage(incoming)
			if (response)
				sendResponse(response, rig)
		}
	}
}

