
import {smartImport} from "./internals/smart-import.js"
import {Api, ApiClient, ClientOptions} from "./interfaces.js"

const promise = smartImport<{apiClient: ApiClient<any>}>("api-client.js")

export async function apiClient<A extends Api<A>>(
	options: ClientOptions
): Promise<A> {
	return (await promise).apiClient(options)
}
