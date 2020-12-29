
import {makeRemote} from "./make-remote.js"
import {jsonHttpRequest} from "../jsonrpc/json-http-request.js"
import {parseJsonResponse} from "../jsonrpc/parse-json-response.js"

import {Api} from "../types/primitives/api.js"
import {Topic} from "../types/primitives/topic.js"
import {GetAuth} from "../types/remote/get-auth.js"
import {ToShape} from "../types/primitives/to-shape.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function loopbackJsonRemote<xAuth, xTopic extends Topic<any>>({
		link,
		shape,
		headers,
		api,
		getAuth,
	}: {
		link: string
		shape: ToShape<xTopic>
		headers: Partial<HttpRequestHeaders>
		api: Api<HttpRequest, HttpResponse>
		getAuth: GetAuth<xAuth>
	}) {

	return makeRemote({
		link,
		shape,
		getAuth,
		requester: async({
				args,
				auth,
				specifier,
			}) => {
			const request = jsonHttpRequest<xAuth>({
				link,
				headers,
				specifier,
				auth,
				args,
			})
			const response = await api(request)
			return parseJsonResponse(response)
		},
	})
}
