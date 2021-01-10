
import {generateRemote} from "./generate-remote.js"
import {jsonHttpRequest} from "../jsonrpc/json-http-request.js"
import {parseJsonResponse} from "../jsonrpc/parse-json-response.js"

import {ApiGroup} from "../types/api/api-group.js"
import {ToShape} from "../types/remote/to-shape.js"
import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"

export function loopbackJsonRemote<xApiGroup extends ApiGroup>({link, shape, servelet}: {
		link: string
		shape: ToShape<xApiGroup>
		servelet: Servelet<HttpRequest, HttpResponse>
	}) {

	return generateRemote({
		link,
		shape,
		requester: async({args, link, auth, specifier}) => {
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
