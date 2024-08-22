
import {JsonRpc} from "./json-rpc.js"
import {ExposedError} from "../core/errors.js"

export async function respond<R>({
		label,
		request,
		action,
		onError,
	}: {
		label: string
		request: JsonRpc.Request
		action: () => Promise<R>
		onError: (error: any) => void
	}): Promise<JsonRpc.Response<R> | null> {

	try {
		const result = await action()

		if (!("id" in request))
			return null

		return {
			result,
			id: request.id,
			jsonrpc: JsonRpc.version,
		}
	}

	catch (error) {
		onError(error)

		if (!("id" in request))
			return null

		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: (error instanceof ExposedError)
				? {
					code: -32000,
					message: `${label} ${error.name}: ${error.message}`,
				}
				: {
					code: -32000,
					message: `${label} unexposed error`,
				},
		}
	}
}

