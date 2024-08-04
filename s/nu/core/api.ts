
import {Service} from "./service.js"
import {JsonRpc} from "./json-rpc.js"
import {obtain} from "../../tools/obtain.js"
import {Endpoint, Services} from "./types.js"

export class Api<S extends Services> {
	constructor(public services: S) {}

	endpoint: Endpoint = async request => {

		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method

		const path = method.split(".")
		const fnName = path.pop()!
		const service = obtain(this.services, path)

		return await respond(request, async() => {
			if (!(service instanceof Service))
				throw new Error(`unknown method ${request.method}`)

			const fn = service.expose(request.params.preAuth)[fnName]

			if (typeof fn !== "function")
				throw new Error(`invalid method ${fnName}`)

			return await fn(...request.params.args)
		})
	}
}

async function respond(
		request: JsonRpc.Request,
		fn: () => Promise<any>,
	): Promise<JsonRpc.Response | null> {

	try {
		const result = await fn()

		if (!("id" in request))
			return null

		return {
			result,
			id: request.id,
			jsonrpc: JsonRpc.version,
		}
	}

	catch (error) {
		if (!("id" in request))
			return null

		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: {
				code: -32000,
				message: error instanceof Error
					? error.message
					: "unknown error",
			},
		}
	}
}

