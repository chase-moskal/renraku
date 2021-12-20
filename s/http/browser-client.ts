
import {RenrakuError} from "../error.js"
import {remoteWithMetaMap} from "./mapping/remote-with-meta-map.js"
import {Api, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, RenrakuMetaMap, RenrakuRequest} from "../types.js"

export function renrakuBrowserClient<xApi extends Api>({url, metaMap}: {
		url: string
		metaMap: RenrakuMetaMap<xApi>
	}) {

	let count = 0

	async function requester({meta, method, params}: RenrakuRequest) {
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
			throw new RenrakuError(error.code, `remote call error: ${error.code} ${error.message} (from "${url}")`)
		else
			return result
	}

	return remoteWithMetaMap(requester, metaMap)
}
