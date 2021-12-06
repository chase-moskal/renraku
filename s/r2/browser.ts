
import {objectMap} from "../tools/object-map.js"
import {JsonRpcResponse, JsonRpcRequest, Api, MetaMap, ApiRemote, RenrakuRequest} from "./types.js"

export const renrakuBrowserClient = () => ({
	httpJsonRpc: (link: string) => {

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

					"Authorization": JSON.stringify(meta),
				},
				body: JSON.stringify(<JsonRpcRequest>{
					jsonrpc: "2.0",
					method,
					params,
					id: count++,
				})
			}).then(r => r.json())
			if (response.error)
				throw new Error(`remote call error: ${response.error.code} ${response.error.message} (from "${link}")`)
			else
				return response.result
		}

		return {

			withMetaMap<xApi extends Api>(map: MetaMap<xApi>) {
				function recurse(mapGroup: MetaMap<xApi>, path: string[] = []): ApiRemote<xApi> {
					return objectMap(mapGroup, (value, key) => {
						const newPath = [...path, key]
						const item = mapGroup[key]
						if (typeof item === "function") {
							const getMeta: () => Promise<any> = item
							return new Proxy({}, {
								set: () => { throw new Error("renraku remote is readonly") },
								get: (target, property: string) => async(...params: any[]) => {
									const method = "." + [...newPath, property].join(".")
									const meta = await getMeta()
									return requester({meta, method, params})
								},
							})
						}
						else {
							return recurse(<any>item, newPath)
						}
					})
				}
				return recurse(map)
			},
		}
	},
})
