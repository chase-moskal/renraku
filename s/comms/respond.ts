
import {Tap} from "../core/types.js"
import {JsonRpc} from "./json-rpc.js"
import {ExposedError} from "../core/errors.js"

export async function respond<R>({
		request,
		action,
		tap,
	}: {
		request: JsonRpc.Request
		action: () => Promise<R>
		tap?: Tap
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
		if (tap)
			tap.requestError({request, error})

		if (!("id" in request))
			return null

		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: (error instanceof ExposedError)
				? {
					code: JsonRpc.errorCodes.serverError,
					message: error.message,
				}
				: {
					code: JsonRpc.errorCodes.unexposedError,
					message: `unexposed error`,
				},
		}
	}
}

