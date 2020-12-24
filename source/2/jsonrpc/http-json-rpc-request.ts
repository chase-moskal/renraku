
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRpcRequest} from "../types/jsonrpc/json-rpc-request.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function httpJsonRpcRequest<xAuth>({path, headers, specifier, auth, args}: {
		path: string
		headers: HttpRequestHeaders
		specifier: string
		auth: xAuth
		args: any[]
	}): HttpRequest {
	return {
		method: "post",
		path,
		headers,
		body: JSON.stringify(<JsonRpcRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
