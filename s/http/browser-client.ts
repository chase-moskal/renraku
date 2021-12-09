
import {RenrakuError} from "../error.js"
import {objectMap} from "./../tools/object-map.js"
import {Api, ApiRemote, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, MetaMap, RenrakuRequest} from "../types.js"

export const renrakuBrowserClient = () => ({
	linkToApiServer(link: string) {

		let count = 0
		async function requester({meta, method, params}: RenrakuRequest) {
			const response: JsonRpcResponse = await fetch(link, {
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
				throw new RenrakuError(error.code, `remote call error: ${error.code} ${error.message} (from "${link}")`)
			else
				return result
		}

		return {
			withMetaMap<xApi extends Api>(map: MetaMap<xApi>) {
				function recurse(mapGroup: MetaMap<xApi>, path: string[] = []): ApiRemote<xApi> {
					return objectMap(mapGroup, (value, key) => {
						const newPath = [...path, key]
						if (typeof value === "function") {
							const getMeta: () => Promise<any> = value
							return new Proxy({}, {
								set: () => { throw new RenrakuError(400, "renraku remote is readonly") },
								get: (target, property: string) => async(...params: any[]) => {
									const method = "." + [...newPath, property].join(".")
									const meta = await getMeta()
									return requester({meta, method, params})
								},
							})
						}
						else {
							return recurse(<any>value, newPath)
						}
					})
				}
				return recurse(map)
			}
		}
	}
})
