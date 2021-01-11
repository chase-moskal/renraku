
import {HttpRequest} from "../types/http/http-request.js"
import {JsonRequest} from "../types/jsonrpc/json-request.js"

export async function parseJsonRequest(request: HttpRequest) {
	const {id, method, params}: JsonRequest = JSON.parse(request.body)
	const specifier = method
	const [meta, ...args] = params
	return {
		requestId: id,
		specifier,
		meta,
		args,
	}
}
