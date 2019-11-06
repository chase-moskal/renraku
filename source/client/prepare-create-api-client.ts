
import {jsonCall} from "./json-call.js"
import {Api, Topic, Methods, ClientOptions, Order} from "../interfaces.js"

export const prepareCreateApiClient = (fetch: typeof window.fetch) =>
	async function createApiClient<A extends Api<A> = Api>({
		url,
		shape
	}: ClientOptions<A>): Promise<A> {
		const client: any = {}

		for (const topic of Object.keys(shape)) {
			client[topic] = <Topic>{methods: {}}

			// attach method callers
			for (const func of Object.keys((<any>shape)[topic].methods)) {
				client[topic].methods[func] = async function(...params: any[]): Promise<any> {
					return jsonCall(fetch, url, <Order>{topic, func, params})
				}
			}
		}

		return <A>client
	}
