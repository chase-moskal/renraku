
import {ApiError} from "../api/api-error.js"
import {HttpResponse} from "../types/http/http-response.js"

export function respondJson(result: any): HttpResponse {
	return {
		status: 200,
		body: JSON.stringify({
			jsonrpc: "2.0",
			result,
		}),
		contentType: "application/json",
	}
}

export interface Responder {
	resultResponse(result: any): HttpResponse
	errorResponse(error: ApiError): HttpResponse
}

export const lol = {
	
}
