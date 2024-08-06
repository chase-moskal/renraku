
import {Service} from "./service.js"
import {JsonRpc} from "./json-rpc.js"
import {obtain} from "../tools/obtain.js"
import {Endpoint, Services} from "./types.js"

export class Api<S extends Services = any> {
	constructor(public services: S) {}

	endpoint: Endpoint = async(request, options = {headers: {}, exposeErrors: false}) => {

		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method

		const path = method.split(".")
		const fnName = path.pop()!
		const service = obtain(this.services, path)

		const action = async() => {
			if (!(service instanceof Service))
				throw new Error(`unknown method ${request.method}`)
			const fn = service.expose(request.params.preAuth)[fnName]
			if (typeof fn !== "function")
				throw new Error(`invalid method ${fnName}`)
			return await fn(...request.params.args)
		}

		return await respond(request, action, options.exposeErrors)
	}
}

async function respond(
		request: JsonRpc.Request,
		fn: () => Promise<any>,
		exposeErrors: boolean,
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
		return JsonRpc.failure(error, request.id, exposeErrors)
	}
}

