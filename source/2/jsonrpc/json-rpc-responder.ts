
import {HttpResponder} from "../types/http/http-responder.js"

const jsonrpc = "2.0"
const errorCode = -32000
const contentType = "application/json"

export const jsonRpcResponder = (): HttpResponder => ({
	resultResponse: (requestId, result) => ({
		contentType,
		status: 200,
		body: JSON.stringify({
			jsonrpc,
			id: requestId,
			result,
		}),
	}),
	errorResponse: (requestId, error) => ({
		contentType,
		status: error.code,
		body: JSON.stringify({
			jsonrpc,
			id: requestId,
			error: {
				code: errorCode,
				message: error.message,
			},
		}),
	}),
})
