
import {HttpResponse} from "../types/http/http-response.js"

export function respondJsonError(code: number, message: string): HttpResponse {
	return {
		status: code,
		body: JSON.stringify({
			jsonrpc: "2.0",
			error: {
				message,
				code: -32000,
			},
		}),
		contentType: "application/json",
	}
}
