
import {JsonResponseError} from "./json-response-error.js"
import {JsonResponseResult} from "./json-response-result.js"
import {HttpResponseHeaders} from "../http/http-response-headers.js"

export interface JsonResponse {
	jsonBody: JsonResponseResult | JsonResponseError
	headers: HttpResponseHeaders
}
