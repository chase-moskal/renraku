
import {createServer} from "http"

import {allowCors} from "./node/allow-cors.js"
import {readStream} from "./node/read-stream.js"
import {readRawHeaders} from "./node/read-raw-headers.js"

import {HttpMethod} from "../types/http/http-method.js"
import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function makeNodeHttpServer(servelet: Servelet<HttpRequest, HttpResponse>) {
	return createServer(allowCors(async(request, response) => {
		const renrakuResponse = await servelet({
			path: request.url,
			body: await readStream(request),
			method: <HttpMethod>request.method,
			headers: <HttpRequestHeaders>readRawHeaders(request.rawHeaders),
		})

		for (const [headerKey, headerValue] of Object.entries(renrakuResponse.headers))
			response.setHeader(headerKey, headerValue)

		response.statusCode = renrakuResponse.status
		response.end(renrakuResponse.body)
	}))
}
