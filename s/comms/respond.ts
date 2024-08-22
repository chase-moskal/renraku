
import {JsonRpc} from "./json-rpc.js"
import {ExposedError} from "../core/errors.js"

export type OnRespondErrorFn = (error: any, id: JsonRpc.Id, method: string) => void

export async function respond<R>({
		request,
		action,
		onError,
	}: {
		request: JsonRpc.Request
		action: () => Promise<R>
		onError: OnRespondErrorFn
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
		onError(error, id, request.method)

		if (!("id" in request))
			return null

		return {
			id: request.id,
			jsonrpc: JsonRpc.version,
			error: (error instanceof ExposedError)
				? {
					code: -32000,
					message: `${error.name}: ${error.message}`,
				}
				: {
					code: -32000,
					message: `unexposed error`,
				},
		}
	}
}

