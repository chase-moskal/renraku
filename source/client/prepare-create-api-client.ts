
import {jsonCall} from "./json-call.js"
import {TopicApi, ClientOptions, Order} from "../interfaces.js"

export const prepareCreateApiClient = (fetch: typeof window.fetch) =>
	async function createApiClient<A extends TopicApi<A> = TopicApi>({
		url,
		shape
	}: ClientOptions<A>): Promise<A> {
		const client = <any>{}

		for (const topic of Object.keys(shape)) {
			client[topic] = {}

			for (const func of Object.keys((<any>shape)[topic])) {
				client[topic][func] = async function(...params: any[]): Promise<any> {
					return jsonCall(fetch, url, <Order>{topic, func, params})
				}
			}
		}

		return <A>client
	}
