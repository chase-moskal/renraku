
import {smartImport} from "./internals/smart-import.js"
import {ApiClientside, ApiClient, ApiClientOptions} from "./types.js"

const promise = smartImport<{apiClient: ApiClient<any>}>("api-client.js")

export async function apiClient<A extends ApiClientside>(
		options: ApiClientOptions<A>
	): Promise<A> {
	return (await promise).apiClient(options)
}
