
import {HttpResponse} from "../types/http/http-response.js"
import {JsonResponseError} from "../types/jsonrpc/json-response-error.js"
import {JsonResponseResult} from "../types/jsonrpc/json-response-result.js"

export function parseJsonResponse(response: HttpResponse): any {
	const json: JsonResponseResult & JsonResponseError = JSON.parse(response.body)

	if (response.status !== 200 || json.error) {
		const message = json.error?.message
		throw new Error(
			message
				? `${response.status}: ${message}`
				: `unknown error`
		)
	}
	else {
		return json.result
	}
}
