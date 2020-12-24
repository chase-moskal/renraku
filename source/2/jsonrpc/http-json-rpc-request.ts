
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRpcRequest} from "../types/jsonrpc/json-rpc-request.js"

export function httpJsonRpcRequest<xAuth>({auth, args, specifier, origin}: {
		auth: xAuth
		args: any[]
		specifier: string
		origin?: string
	}): HttpRequest {
	return {

		headers: origin
			? {origin}
			: {origin: undefined},

		body: JSON.stringify(<JsonRpcRequest>{
			jsonrpc: "2.0",
			method: specifier,
			params: [auth, ...args],
		}),
	}
}
