
import {generateRemote} from "./generate-remote.js"
import {makeJsonRequester} from "./make-json-requester.js"

import {ApiGroup} from "../types/api/api-group.js"
import {ToShape} from "../types/remote/to-shape.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function generateJsonBrowserRemote<xApiGroup extends ApiGroup>({link, shape, headers}: {
		link: string
		shape: ToShape<xApiGroup>
		headers: Partial<HttpRequestHeaders>
	}) {

	return generateRemote({
		link,
		shape,
		requester: makeJsonRequester({
			headers,
			fetch: window.fetch,
		}),
	})
}
