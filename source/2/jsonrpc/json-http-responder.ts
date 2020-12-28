
import {contentTypeJson} from "./content-type-json.js"

import {Responder} from "../types/api/responder.js"
import {HttpResponse} from "../types/http/http-response.js"
import {JsonResponseError} from "../types/jsonrpc/json-response-error.js"
import {HttpResponseHeaders} from "../types/http/http-response-headers.js"
import {JsonResponseResult} from "../types/jsonrpc/json-response-result.js"

const jsonrpc = "2.0"
const errorCode = -32000

export const makeJsonHttpResponder = ({headers}: {
		headers: Partial<HttpResponseHeaders>
	}): Responder<HttpResponse> => ({

	resultResponse: (requestId, result) => ({
		status: 200,
		headers: {
			"Content-Type": contentTypeJson,
			...headers,
		},
		body: JSON.stringify(<JsonResponseResult>{
			jsonrpc,
			id: requestId,
			result,
		}),
	}),

	errorResponse: (requestId, error) => ({
		status: error.code,
		headers: {
			"Content-Type": contentTypeJson,
			...headers,
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
})
