
import {HttpResponse} from "../types/http/http-response.js"

export function jsonResponse(result: any): HttpResponse {
	return {
		status: 200,
		body: JSON.stringify(result),
		contentType: "application/json",
	}
}
