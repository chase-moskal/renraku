
import {Api, ClientOptions, RequestBody} from "../interfaces.js"
import {jsonCall} from "./json-call.js"

export async function createApiClient<A extends Api>({
	url,
	shape
}: ClientOptions<A>): Promise<A> {
	const client = <any>{}

	for (const topic of Object.keys(shape)) {
		client[topic] = {}

		for (const func of Object.keys((<any>shape)[topic])) {
			client[topic][func] = async function(...params: any[]): Promise<any> {
				return jsonCall(url, <RequestBody>{topic, func, params})
			}
		}
	}

	return <A>client
}
