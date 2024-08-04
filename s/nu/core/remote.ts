
import {Api} from "./api.js"
import {objectMap} from "../../tools/object-map.js"
import {Actualize, Endpoint, GetServices, RemoteConfig} from "./types.js"

export class Remote<A extends Api<any>> {
	fns: Actualize<GetServices<A>>

	constructor(
			public endpoint: Endpoint,
			public config: RemoteConfig<GetServices<A>>,
		) {

		const recurse = (current: RemoteConfig<any>, path: string[]) => {
			if (typeof current === "function") {
				const overrides: Record<string, any> = {}
				return new Proxy({}, {

					set: (_t, key: string, value: any) => {
						overrides[key] = value
						return true
					},

					get: (_t, key: string) => {
						// add leading dot
						const method = "." + [...path, key].join(".")
						return overrides[key] ?? (async(...data: any[]) => {
							const {preAuth, notification = false} = await current()
							return this.#request(notification, preAuth, method, data)
						})
					},
				})
			}
			else {
				return objectMap(current, (next, key) => recurse(next, [...path, key]))
			}
		}

		this.fns = recurse(config, []) as any
	}

	#getId = (() => {
		let count = 0
		return () => count++
	})()

	async #request(notify: boolean, preAuth: any, method: string, args: any): Promise<any> {
		const notification = {
			jsonrpc: "2.0" as const,
			method,
			params: {preAuth, args},
		}

		const response = await this.endpoint(
			notify
				? notification
				: {...notification, id: this.#getId()}
		)

		if ("error" in response)
			throw new Error(response.error.message)

		return response.result
	}
}

