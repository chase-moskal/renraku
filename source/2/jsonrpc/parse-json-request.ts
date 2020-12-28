
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"

export function parseJsonRequest(request: HttpRequest) {
	const {id, method, params}: JsonRequest = JSON.parse(request.body)
	const specifier = method
	const [auth, ...args] = params
	return {
		requestId: id,
		specifier,
		auth,
		args,
	}
}
