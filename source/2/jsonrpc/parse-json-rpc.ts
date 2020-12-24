
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRpcRequest} from "../types/jsonrpc/json-rpc-request.js"

export function parseJsonRpc(request: HttpRequest) {
	const {id, method, params}: JsonRpcRequest = JSON.parse(request.body)
	const specifier = method
	const [auth, ...args] = params
	return {
		requestId: id,
		specifier,
		auth,
		args,
	}
}
