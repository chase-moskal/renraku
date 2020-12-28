
import {Suite, assert} from "cynic"

import {makeApi} from "./api/make-api.js"
import {ApiError} from "./api/api-error.js"
import {asTopic} from "./identities/as-topic.js"
import {ToShape} from "./types/primitives/to-shape.js"
import {HttpRequest} from "./types/http/http-request.js"
import {parseJsonRequest} from "./jsonrpc/parse-json-request.js"
import {HttpResponse} from "./types/http/http-response.js"
import {jsonRpcResponder} from "./jsonrpc/json-rpc-responder.js"
import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"
import {httpJsonRpcRequest} from "./jsonrpc/http-json-rpc-request.js"
import { contentTypeJson } from "./jsonrpc/content-type-json.js"

const goodLink = "http://localhost:5000/"
const {origin: goodOrigin, pathname: goodPath} = new URL(goodLink)

export default <Suite>{
	"make an api and execute a procedure": async() => {
		type MyAuth = {token: string}
		type MyMeta = {access: {user: {}}}
		type MyTopic = ReturnType<typeof makeMyTopic>
		const apiAssertion = (condition: boolean, message: string) => {
			if (!condition) throw new ApiError(500, message)
		}

		// topic
		const makeMyTopic = () => asTopic<MyMeta>()({
			math: {
				async sum(meta, x: number, y: number) {
					return x + y
				}
			}
		})

		// shape
		const myShape: ToShape<MyTopic> = {
			math: {sum: true},
		}

		// serverside api
		const api = makeApi<HttpRequest, HttpResponse, MyAuth, MyMeta>({
			expose: makeMyTopic(),
			parse: parseJsonRequest,
			authorize: async(request, auth) => {
				apiAssertion(request.headers.origin == goodOrigin, `forbidden origin "${request.headers.origin}"`)
				apiAssertion(!!auth.token, `invalid token`)
				return {access: {user: {}}}
			},
			responder: jsonRpcResponder,
		})

		// manually execute api
		const directResult = await api(httpJsonRpcRequest<MyAuth>({
			link: goodLink,
			headers: {"Content-Type": contentTypeJson},
			specifier: "math.sum",
			auth: {token: "a123"},
			args: [2, 3],
		}))
		assert(directResult, "direct result should be returned")

		debugger

		// remote execution
		const remote = loopbackJsonRemote<MyAuth, MyTopic>({
			link: goodLink,
			shape: myShape,
			headers: {
				"Origin": goodOrigin,
			},
			api,
			getAuth: async() => ({token: "a123"}),
		})
		const remoteResult = await remote.math.sum(2, 3)
		assert(remoteResult === 5, "remote result should be 5")
	},
}
