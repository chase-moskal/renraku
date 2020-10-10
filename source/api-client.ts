
import {smartImport} from "./internals/smart-import.js"
import {declientizeTopic, declientizeApi} from "./curries.js"
import {ClientApi, ApiClient, ApiClientOptions, Topic, Api, ServerResponse} from "./types.js"

const promise = smartImport<{apiClient: ApiClient<any>}>("api-client.js")

export async function apiClient<A extends ClientApi>(
		options: ApiClientOptions<A>
	): Promise<A> {
	return (await promise).apiClient(options)
}

const getRequest = async() => ({})
const processResponse = async(response: ServerResponse<any>) => response.result

export function simpleClientTopic<T extends Topic>(topic: T) {
	return declientizeTopic(getRequest, processResponse, topic)
}

export function simpleClientApi<A extends Api>(api: A) {
	return declientizeApi(getRequest, processResponse, api)
}
