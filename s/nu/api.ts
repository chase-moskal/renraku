
import {Service} from "./service.js"
import {obtain} from "../tools/obtain.js"
import {Endpoint, NestedServices} from "./types.js"

export class Api<Services extends NestedServices> {
	constructor(public services: Services) {}

	endpoint: Endpoint = async request => {

		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method

		const path = method.split(".")
		const fnName = path.pop()!
		const service = obtain(this.services, path)

		try {
			if (!(service instanceof Service))
				throw new Error(`unknown method ${request.method}`)

			const fn = service.expose(request.params.preAuth)[fnName]

			if (typeof fn !== "function")
				throw new Error(`invalid method ${fnName}`)

			return {
				jsonrpc: "2.0",
				id: request.id,
				result: await fn(...request.params.args),
			}
		}
		catch (error) {
			return {
				jsonrpc: "2.0",
				id: request.id,
				error: {
					code: -32000,
					message: error?.message ?? "unknown error",
				},
			}
		}
	}
}

