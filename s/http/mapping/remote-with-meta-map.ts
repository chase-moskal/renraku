
import {RenrakuError} from "../../error.js"
import {objectMap} from "../../tools/object-map.js"
import {Api, ApiRemote, MetaMap, Requester} from "../../types.js"

export function remoteWithMetaMap<xApi extends Api>(requester: Requester, map: MetaMap<xApi>) {
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
