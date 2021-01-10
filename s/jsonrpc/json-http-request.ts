
import {contentTypeText} from "./content-type-text.js"

import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function jsonHttpRequest<xAuth>({
		link,
		auth,
		args,
		specifier,
		requestOrigin,
		headers: moreHeaders,
	}: {
		link: string
		auth: xAuth
		args: any[]
		specifier: string
		headers: Partial<HttpRequestHeaders>
		requestOrigin?: string
	}): HttpRequest {

	return {
		method: "post",
		path: new URL(link).pathname,
		headers: {

			// json requests are sent as plain text
			// in order to avoid any cors 'options' preflight requests
			// by qualifying as a cors "simple request"
			"content-type": contentTypeText,

			...requestOrigin
				? {"origin": requestOrigin}
				: {},

			...moreHeaders,
		},
		body: JSON.stringify(<JsonRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
