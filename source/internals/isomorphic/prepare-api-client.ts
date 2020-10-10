
import {err} from "../../errors.js"
import {ClientApi, ClientOptions, Topic, ClientContext, ClientResponse} from "../../types.js"
import {SignatureSign, Order} from "../internal-types.js"

import {jsonCall} from "./json-call.js"

export const prepareApiClient = ({fetch}: {
		fetch: typeof window.fetch
	}) => (
	function apiClient<A extends ClientApi>({
			url,
			shape,
		}: ClientOptions<A>): A {
		const client: any = {}

		for (const topic of Object.keys(shape)) {
			client[topic] = <Topic>{}

			// attach method callers
			for (const [key, value] of Object.entries((<any>shape)[topic])) {
				if (value === "method") {
					const func = key
					client[topic][func] = async(
						{headers}: ClientContext,
						...params: any[]
					): Promise<ClientResponse> => jsonCall({
						url,
						fetch,
						headers,
						data: <Order>{topic, func, params},
					})
				}
				else throw err(400, `unknown shape item "${value}"`)
			}
		}

		return <A>client
	}
)
