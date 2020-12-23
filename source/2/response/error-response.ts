
import {HttpResponse} from "../types/http/http-response.js"

export function errorResponse(code: number, error: string): HttpResponse {
	return {
		body: error,
		status: code,
		contentType: "text/plain",
	}
}
