
import {fixHeaderCasing} from "../tools/fix-header-casing.js"
import {jsonHttpRequest} from "../jsonrpc/json-http-request.js"
import {parseJsonResponse} from "../jsonrpc/parse-json-response.js"

import {Requester} from "../types/remote/requester.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"
import {HttpResponseHeaders} from "../types/http/http-response-headers.js"

export function makeJsonRequester<xAuth>({fetch, headers}: {
		fetch: typeof window.fetch
		headers: Partial<HttpRequestHeaders>
	}): Requester<xAuth> {

	return async function requester({link, args, auth, specifier}) {
		const request = jsonHttpRequest({
			link,
			args,
			auth,
			headers,
			specifier,
		})

		const fetchRequest = new window.Request(link, {
			body: request.body,
			method: request.method,
			headers: fixHeaderCasing(request.headers),
		})
		const fetchResponse = await fetch(fetchRequest)

		const collectHeaders: Partial<HttpResponseHeaders> = {}
		fetchResponse.headers.forEach((value, key) => collectHeaders[key] = value)
		const responseHeaders: HttpResponseHeaders = <any>collectHeaders

		const result = parseJsonResponse({
			headers: responseHeaders,
			status: fetchResponse.status,
			body: await fetchResponse.text(),
		})

		return result
	}
}
