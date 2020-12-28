
import {makeRemote} from "./make-remote.js"
import {Topic} from "../types/primitives/topic.js"
import {GetAuth} from "../types/remote/get-auth.js"
import {ToShape} from "../types/primitives/to-shape.js"
import {makeFetchJsonRequester} from "./requesters/make-fetch-json-requester.js"

import isomorphicFetch from "isomorphic-fetch"

export function makeJsonRemoteNode<xAuth, xTopic extends Topic<any>>({link, shape, getAuth}: {
		link: string
		shape: ToShape<xTopic>
		getAuth: GetAuth<xAuth>
	}) {

	return makeRemote({
		link,
		shape,
		getAuth,
		requester: makeFetchJsonRequester({fetch: isomorphicFetch}),
	})
}
