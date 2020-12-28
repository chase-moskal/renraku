
import {makeRemote} from "./make-remote.js"
import {Topic} from "../types/primitives/topic.js"
import {GetAuth} from "../types/remote/get-auth.js"
import {ToShape} from "../types/primitives/to-shape.js"
import {HttpRequestHeaders} from "../types/http/http-request-headers.js"
import {makeJsonRequester} from "./requesters/make-fetch-json-requester.js"

export function makeJsonRemoteBrowser<xAuth, xTopic extends Topic<any>>({
		link,
		shape,
		headers,
		getAuth,
	}: {
		link: string
		shape: ToShape<xTopic>
		headers: Partial<HttpRequestHeaders>
		getAuth: GetAuth<xAuth>
	}) {

	return makeRemote({
		link,
		shape,
		getAuth,
		requester: makeJsonRequester({
			headers,
			fetch: window.fetch,
		}),
	})
}
