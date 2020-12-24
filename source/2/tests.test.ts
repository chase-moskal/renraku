
import {Suite, assert} from "cynic"

import {makeApi} from "./api/make-api.js"
import {ApiError} from "./api/api-error.js"
import {asTopic} from "./identities/as-topic.js"
import {ToShape} from "./types/primitives/to-shape.js"
import {HttpRequest} from "./types/http/http-request.js"
import {parseJsonRpc} from "./jsonrpc/parse-json-rpc.js"
import {HttpResponse} from "./types/http/http-response.js"
import {jsonRpcResponder} from "./jsonrpc/json-rpc-responder.js"
import {loopbackHttpRemote} from "./remote/loopback-http-remote.js"
import {httpJsonRpcRequest} from "./jsonrpc/http-json-rpc-request.js"

const originGood = "http://localhost:5000"

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
			parse: parseJsonRpc,
			authorize: async(request, auth) => {
				apiAssertion(request.headers.origin !== originGood, `forbidden origin "${request.headers.origin}"`)
				apiAssertion(!auth.token, `invalid token`)
				return {access: {user: {}}}
			},
			responder: jsonRpcResponder,
		})

		// manually execute api
		const directResult = await api(httpJsonRpcRequest<MyAuth>({
			auth: {token: "a123"},
			args: [2, 3],
			specifier: "math.sum",
			origin: originGood,
		}))
		assert(directResult, "direct result should be returned")

		// remote execution
		const remote = loopbackHttpRemote<MyAuth, MyTopic>({
			link: "",
			origin: "",
			shape: myShape,
			api,
			getAuth: async() => ({token: "a123"}),
		})
		const remoteResult = await remote.math.sum(2, 3)
		assert(remoteResult === 5, "remote result should be 5")
	},
}
