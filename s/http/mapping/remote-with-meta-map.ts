
import {objectMap} from "../../tools/object-map.js"
import {RenrakuApi, ApiRemote, RenrakuMetaMap, Requester, RenrakuServiceOptions} from "../../types.js"

export function remoteWithMetaMap<xApi extends RenrakuApi>(
		requester: Requester,
		map: RenrakuMetaMap<xApi>,
		options: RenrakuServiceOptions = {}
	) {
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
							return options.spike
								? options.spike(
									method,
									async(...params2) => requester({
										meta, method, params: params2
									}),
									...params
								)
								: requester({meta, method, params})
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
