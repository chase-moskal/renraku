
import {HttpMethod} from "./http-method.js"
import {HttpRequestHeaders} from "./http-request-headers.js"

export type HttpRequest = {
	method: HttpMethod
	path: string
	body: string
	headers: HttpRequestHeaders
}
