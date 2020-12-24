
import {HttpResponse} from "../types/http/http-response.js"

export function respondTextError(code: number, message: string): HttpResponse {
	return {
		body: message,
		status: code,
		contentType: "text/plain",
	}
}
