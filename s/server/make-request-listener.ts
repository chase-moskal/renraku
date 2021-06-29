
import {RequestListener} from "http"

import {readStream} from "./node/read-stream.js"
import {readRawHeaders} from "./node/read-raw-headers.js"

import {HttpMethod} from "../types/http/http-method.js"
import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {lowercasedHeaders} from "../tools/lowercased-headers.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function makeRequestListener(
		servelet: Servelet<HttpRequest, HttpResponse>
	): RequestListener {

	return async(request, response) => {
		const renrakuResponse = await servelet({
			path: request.url,
			body: await readStream(request),
			method: <HttpMethod>request.method.toLowerCase(),
			headers: <HttpRequestHeaders>lowercasedHeaders(
				readRawHeaders(request.rawHeaders)
			),
		})

		for (const [headerKey, headerValue] of Object.entries(renrakuResponse.headers))
			response.setHeader(headerKey, headerValue)

		response.statusCode = renrakuResponse.status
		response.end(renrakuResponse.body)
	}
}
