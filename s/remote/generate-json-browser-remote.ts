
import {generateRemote} from "./generate-remote.js"
import {makeJsonRequester} from "./make-json-requester.js"

import {Api} from "../types/api/api.js"
import {Shape} from "../types/remote/shape.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"

export function generateJsonBrowserRemote<xApi extends Api>({link, shape, headers}: {
		link: string
		shape: Shape<xApi>
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
