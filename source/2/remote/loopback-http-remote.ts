
import {makeRemote} from "./make-remote.js"
import {Api} from "../types/primitives/api.js"
import {Topic} from "../types/primitives/topic.js"
import {GetAuth} from "../types/remote/get-auth.js"
import {ToShape} from "../types/primitives/to-shape.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"
import {httpJsonRpcRequest} from "../jsonrpc/http-json-rpc-request.js"

export function loopbackHttpRemote<xAuth, xTopic extends Topic<any>>({
		link,
		shape,
		origin,
		api,
		getAuth,
	}: {
		link: string
		origin: string
		shape: ToShape<xTopic>
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
			}) => api(httpJsonRpcRequest<xAuth>({
			auth,
			args,
			origin,
			specifier,
		})),
	})
}
