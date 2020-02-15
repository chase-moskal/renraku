
import {err} from "../../errors.js"
import {Order} from "../internal-interfaces.js"
import {Api, ClientOptions, Topic} from "../../interfaces.js"

import {jsonCall} from "./json-call.js"

export const prepareApiClient = (fetch: typeof window.fetch) =>
	function apiClient<A extends Api<A> = Api>({
		url,
		shape,
		credentials,
	}: ClientOptions<A>): A {
		const client: any = {}

		for (const topic of Object.keys(shape)) {
			client[topic] = <Topic>{}

			// attach method callers
			for (const [key, value] of Object.entries((<any>shape)[topic])) {
				if (value === "method") {
					const func = key
					client[topic][func] = async function(...params: any[]): Promise<any> {
						return jsonCall({
							url,
							fetch,
							credentials,
							data: <Order>{topic, func, params},
						})
					}
				}
				else throw err(400, `unknown shape item "${value}"`)
			}
		}

		return <A>client
	}
