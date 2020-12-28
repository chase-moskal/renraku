
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function httpJsonRpcRequest<xAuth>({link, headers, specifier, auth, args}: {
		link: string
		headers: HttpRequestHeaders
		specifier: string
		auth: xAuth
		args: any[]
	}): HttpRequest {

	const {origin, pathname} = new URL(link)

	return {
		method: "post",
		path: pathname,
		headers: {
			origin,
			...headers,
		},
		body: JSON.stringify(<JsonRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
