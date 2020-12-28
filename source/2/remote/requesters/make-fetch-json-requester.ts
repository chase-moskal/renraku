
import {Requester} from "../../types/remote/requester.js"
import {httpJsonRpcRequest} from "../../jsonrpc/http-json-rpc-request.js"
import {JsonResponseError} from "../../types/jsonrpc/json-response-error.js"
import {HttpResponseHeaders} from "../../types/http/http-response-headers.js"
import {JsonResponseResult} from "../../types/jsonrpc/json-response-result.js"
import { parseJsonResponse } from "source/2/jsonrpc/parse-json-response.js"

import {contentTypeJson} from "../../jsonrpc/content-type-json.js"

export function makeFetchJsonRequester<xAuth>({fetch}: {
		fetch: typeof window.fetch
	}): Requester<xAuth> {

	return async function requester({link, args, auth, specifier}) {
		const request = httpJsonRpcRequest({
			link,
			args,
			auth,
			specifier,
			headers: {
				"Content-Type": contentTypeJson,
			},
		})
		const fetchRequest = new window.Request(link, {
			method: request.method,
			headers: request.headers,
			body: request.body,
		})
		const fetchResponse = await fetch(fetchRequest)

		const collectHeaders: Partial<HttpResponseHeaders> = {}
		fetchResponse.headers.forEach((value, key) => collectHeaders[key] = value)
		const responseHeaders: HttpResponseHeaders = <any>collectHeaders

		const response = parseJsonResponse({
			status: fetchResponse.status,
			body: await fetchResponse.text(),
			headers: responseHeaders,
		})

		const json: JsonResponseResult & JsonResponseError = await fetchResponse.json()

		if (fetchResponse.status !== 200 || json.error) {
			const message = json.error?.message
			throw new Error(
				message
					? `${fetchResponse.status}: ${message}`
					: `unknown error`
			)
		}
		else {
			return json.result
		}
	}
}
