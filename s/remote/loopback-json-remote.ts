
import {generateRemote} from "./generate-remote.js"
import {jsonHttpRequest} from "../jsonrpc/json-http-request.js"
import {parseJsonResponse} from "../jsonrpc/parse-json-response.js"

import {Api} from "../types/api/api.js"
import {ToShape} from "../types/remote/to-shape.js"
import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function loopbackJsonRemote<xApi extends Api>({link, shape, headers, servelet}: {
		link: string
		shape: ToShape<xApi>
		headers: Partial<HttpRequestHeaders>
		servelet: Servelet<HttpRequest, HttpResponse>
	}) {

	return generateRemote({
		link,
		shape,
		requester: async({args, link, meta, specifier}) => {
			const request = jsonHttpRequest({
				link,
				args,
				meta,
				headers,
				specifier,
			})
			const response = await servelet(request)
			return parseJsonResponse(response)
		},
	})
}
