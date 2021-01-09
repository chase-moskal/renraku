
import {contentTypeText} from "./content-type-text.js"

import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function jsonHttpRequest<xAuth>({link, headers, specifier, auth, args}: {
		link: string
		auth: xAuth
		args: any[]
		specifier: string
		headers: Partial<HttpRequestHeaders>
	}): HttpRequest {

	const {origin, pathname} = new URL(link)

	return {
		method: "post",
		path: pathname,
		headers: {
			"origin": origin,

			// json requests are sent as plain text
			// in order to avoid any cors 'options' preflight requests
			// by qualifying as a cors "simple request"
			"content-type": contentTypeText,

			...headers,
		},
		body: JSON.stringify(<JsonRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
