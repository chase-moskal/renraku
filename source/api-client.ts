
import {smartImport} from "./internals/smart-import.js"
import {curryTopicAugmentation, curryApiAugmentation} from "./curries.js"
import {ApiClientside, ApiClient, ApiClientOptions, Topic, Api, ServerResponse} from "./types.js"

const promise = smartImport<{apiClient: ApiClient<any>}>("api-client.js")

export async function apiClient<A extends ApiClientside>(
		options: ApiClientOptions<A>
	): Promise<A> {
	return (await promise).apiClient(options)
}

const getRequest = async() => ({})
const processResponse = async(response: ServerResponse<any>) => response.result

export function simpleClientTopic<T extends Topic>(topic: T) {
	return curryTopicAugmentation(getRequest, processResponse, topic)
}

export function simpleClientApi<A extends Api>(api: A) {
	return curryApiAugmentation(getRequest, processResponse, api)
}
