
import {HttpResponseHeaders} from "./http-response-headers.js"

export type HttpResponse = {
	body: string
	status: number
	headers: HttpResponseHeaders
}
