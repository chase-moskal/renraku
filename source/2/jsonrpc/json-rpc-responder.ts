
import {Responder} from "../types/api/responder.js"
import {HttpResponse} from "../types/http/http-response.js"
import {JsonResponseError} from "../types/jsonrpc/json-response-error.js"
import {JsonResponseResult} from "../types/jsonrpc/json-response-result.js"

import {contentTypeJson} from "./content-type-json.js"

const jsonrpc = "2.0"
const errorCode = -32000

export const jsonRpcResponder: Responder<HttpResponse> = {

	resultResponse: (requestId, result) => ({
		contentType: contentTypeJson,
		status: 200,
		headers: {
			"Content-Type": contentTypeJson,
		},
		body: JSON.stringify(<JsonResponseResult>{
			jsonrpc,
			id: requestId,
			result,
		}),
	}),

	errorResponse: (requestId, error) => ({
		contentType: contentTypeJson,
		status: error.code,
		headers: {
			"Content-Type": contentTypeJson,
		},
		body: JSON.stringify(<JsonResponseError>{
			jsonrpc,
			id: requestId,
			error: {
				code: errorCode,
				message: error.message,
			},
		}),
	}),
}
