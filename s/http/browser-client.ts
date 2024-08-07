
import {ApiError} from "../error.js"
import {remote} from "../general/remote.js"
import {Api, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, Metas, Request} from "../types.js"

export function browserClient<xApi extends Api>({url, metas}: {
		url: string
		metas: Metas<xApi>
	}) {

	let count = 0

	async function requester({meta, method, params}: Request) {
		const response: JsonRpcResponse = await fetch(url, {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "omit",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			headers: {

				// sent as plain text, to avoid cors "options" preflight requests,
				// by qualifying as a cors "simple request"
				"Content-Type": "text/plain; charset=utf-8",
			},
			body: JSON.stringify(<JsonRpcRequestWithMeta>{
				jsonrpc: "2.0",
				method,
				params,
				id: count++,
				meta,
			})
		}).then(r => r.json())
		const {error} = <JsonRpcErrorResponse>response
		const {result} = <JsonRpcSuccessResponse>response
		if (error)
			throw new ApiError(error.code, `remote call error: ${error.code} ${error.message} (from "${url}")`)
		else
			return result
	}

	return remote(requester, metas)
}
