
import {contentTypeJson} from "./content-type-json.js"

import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function jsonHttpRequest<xAuth>({link, headers, specifier, auth, args}: {
		link: string
		headers: Partial<HttpRequestHeaders>
		specifier: string
		auth: xAuth
		args: any[]
	}): HttpRequest {

	const {origin, pathname} = new URL(link)

	return {
		method: "post",
		path: pathname,
		headers: {
			"Origin": origin,
			"Content-Type": contentTypeJson,
			...headers,
		},
		body: JSON.stringify(<JsonRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
