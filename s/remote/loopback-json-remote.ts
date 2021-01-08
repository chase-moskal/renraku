
import {generateRemote} from "./generate-remote.js"
import {jsonHttpRequest} from "../jsonrpc/json-http-request.js"
import {parseJsonResponse} from "../jsonrpc/parse-json-response.js"

import {ToShape} from "../types/remote/to-shape.js"
import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {ApiGroupings} from "../types/api/api-groupings.js"

export function loopbackJsonRemote<xGroupings extends ApiGroupings>({ link, shape, servelet }: {
	link: string
	shape: ToShape<xGroupings>
	servelet: Servelet<HttpRequest, HttpResponse>
}) {
	return generateRemote({
		link,
		shape,
		requester: async ({ args, link, auth, specifier }) => {
			const request = jsonHttpRequest({
				link,
				args,
				auth,
				specifier,
				headers: {},
			})
			const response = await servelet(request)
			return parseJsonResponse(response)
		},
	})
}
