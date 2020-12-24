
import {Responder} from "../types/api/responder.js"
import {HttpResponse} from "../types/http/http-response.js"

const jsonrpc = "2.0"
const errorCode = -32000
const contentType = "application/json"

export const jsonRpcResponder: Responder<HttpResponse> = {

	resultResponse: (requestId, result) => ({
		contentType,
		status: 200,
		headers: {},
		body: JSON.stringify({
			jsonrpc,
			id: requestId,
			result,
		}),
	}),

	errorResponse: (requestId, error) => ({
		contentType,
		status: error.code,
		headers: {},
		body: JSON.stringify({
			jsonrpc,
			id: requestId,
			error: {
				code: errorCode,
				message: error.message,
			},
		}),
	}),
}
