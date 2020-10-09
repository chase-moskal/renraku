
import {smartImport} from "./internals/smart-import.js"
import {curryTopicAugmentation, curryApiAugmentation} from "./curries.js"
import {ApiClientside, ApiClient, ApiClientOptions, Topic, Api} from "./types.js"

const promise = smartImport<{apiClient: ApiClient<any>}>("api-client.js")

export async function apiClient<A extends ApiClientside>(
		options: ApiClientOptions<A>
	): Promise<A> {
	return (await promise).apiClient(options)
}

export function simpleClientTopic<T extends Topic>(topic: T) {
	return curryTopicAugmentation(
		async() => ({}),
		async(response) => response.result,
		topic,
	)
}

export function simpleClientApi<A extends Api>(api: A) {
	return curryApiAugmentation(
		async() => ({}),
		async(response) => response.result,
		api,
	)
}
