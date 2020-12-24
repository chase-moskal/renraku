
import {HttpResponseHeaders} from "./http-request-response.js"

export type HttpResponse = {
	body: string
	status: number
	contentType: string
	headers: HttpResponseHeaders
}
