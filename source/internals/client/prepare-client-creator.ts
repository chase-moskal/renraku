
import {jsonCall} from "./json-call.js"
import {Order} from "../internal-interfaces.js"
import {Api, Topic, ClientOptions} from "../../interfaces.js"

export const prepareApiClient = (fetch: typeof window.fetch) =>
	function apiClient<A extends Api<A> = Api>({
		url,
		shape
	}: ClientOptions<A>): A {
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
