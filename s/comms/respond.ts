
import {JsonRpc} from "./json-rpc.js"
import {OnCallError} from "../core/types.js"
import {ExposedError} from "../core/errors.js"

export async function respond<R>({
		request,
		action,
		onCallError,
	}: {
		request: JsonRpc.Request
		action: () => Promise<R>
		onCallError: OnCallError
	}): Promise<JsonRpc.Response<R> | null> {

	const id = JsonRpc.getId(request)

	try {
		const result = await action()

		if (id === null)
			return null

		return {
			id,
			result,
			jsonrpc: JsonRpc.version,
		}
	}

	catch (error) {
		onCallError(error, request, false)

		if (!("id" in request))
			return null

		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: (error instanceof ExposedError)
				? {
					code: JsonRpc.errorCodes.serverError,
					message: `${error.name}: ${error.message}`,
				}
				: {
					code: JsonRpc.errorCodes.unexposedError,
					message: `unexposed error`,
				},
		}
	}
}

