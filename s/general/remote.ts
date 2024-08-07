
import {objectMap} from "../tools/object-map.js"
import {Api, ApiRemote, Metas, Servelet, ServiceOptions} from "../types.js"

export function remote<xApi extends Api>(
		requester: Servelet,
		metas: Metas<xApi>,
		options: ServiceOptions = {}
	) {
	function recurse(group: Metas<xApi>, path: string[] = []): ApiRemote<xApi> {
		return objectMap(group, (value, key) => {
			const newPath = [...path, key]
			if (typeof value === "function") {
				const getMeta: () => Promise<any> = value
				const overrides: {[key: string]: any} = {}
				return new Proxy({}, {
					set: (_t, key: string, value: any) => {
						overrides[key] = value
						return true
					},
					get: (_t, property: string) => (
						overrides[key] ?? (async(...params: any[]) => {
							const joinedPath = [...newPath, property].join(".")
							const method = "." + joinedPath
							const meta = await getMeta()
							return options.spike
								? options.spike(
									joinedPath,
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
	return recurse(metas)
}

