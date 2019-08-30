
import {Api, ClientOptions, RequestBody} from "../interfaces.js"

import {jsonCall} from "./json-call.js"

const keys = (o: Object) => Object.keys(o)

export async function createApiClient<A extends Api>({
	url,
	shape
}: ClientOptions<A>): Promise<A> {
	const client = <Api>{}

	for (const topic of keys(shape)) {
		client[topic] = {}

		for (const func of keys(shape[topic])) {
			client[topic][func] = async function(...params: any[]): Promise<any> {
				return jsonCall(url, <RequestBody>{topic, func, params})
			}
		}
	}

	return <A>client
}
