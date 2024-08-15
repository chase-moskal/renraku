
import {JsonRpc} from "./json-rpc.js"

export async function respond(
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
		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: (exposeErrors && error instanceof Error)
				? {
					code: -32000,
					message: `${error.name}: ${error.message}`,
					data: error.stack,
				}
				: {
					code: -32000,
					message: "error",
				},
		}
	}
}

