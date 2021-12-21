
import {objectMap} from "../../tools/object-map.js"
import {RenrakuApi, ApiRemote, RenrakuMetaMap, Requester} from "../../types.js"

export function remoteWithMetaMap<xApi extends RenrakuApi>(requester: Requester, map: RenrakuMetaMap<xApi>) {
	function recurse(mapGroup: RenrakuMetaMap<xApi>, path: string[] = []): ApiRemote<xApi> {
		return objectMap(mapGroup, (value, key) => {
			const newPath = [...path, key]
			if (typeof value === "function") {
				const getMeta: () => Promise<any> = value
				const overrides: {[key: string]: any} = {}
				return new Proxy({}, {
					set: (t, key: string, value: any) => {
						overrides[key] = value
						return true
					},
					get: (t, property: string) => (
						overrides[key] ?? (async(...params: any[]) => {
							const method = "." + [...newPath, property].join(".")
							const meta = await getMeta()
							return requester({meta, method, params})
						})
					),
				})
			}
			else {
				return recurse(<any>value, newPath)
			}
		})
	}
	return recurse(map)
}
