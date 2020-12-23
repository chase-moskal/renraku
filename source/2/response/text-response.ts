
import {HttpResponse} from "../types/http/http-response.js"

export function textResponse(text: string): HttpResponse {
	return {
		body: text,
		status: 200,
		contentType: "text/plain",
	}
}
