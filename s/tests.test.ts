
import {Suite, assert} from "cynic"

import {makeApi, makeApi2, PolicyOptions, ToPolicy, asPolicy} from "./api/make-api.js"
import {ApiError} from "./api/api-error.js"
import {asTopic} from "./identities/as-topic.js"
import {ToShape} from "./types/primitives/to-shape.js"
import {HttpRequest} from "./types/http/http-request.js"
import {HttpResponse} from "./types/http/http-response.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {parseJsonRequest} from "./jsonrpc/parse-json-request.js"
import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"
import {makeJsonHttpResponder} from "./jsonrpc/json-http-responder.js"
import {JsonRpcId} from "./types/jsonrpc/json-rpc-id.js"

const goodLink = "http://localhost:5000/"
const {origin: goodOrigin} = new URL(goodLink)

export default <Suite>{
	"make an api and execute a procedure": async() => {
		type MyAuth = {token: string}
		type MyMeta = {access: {user: {}}}
		type MyTopic = ReturnType<typeof makeMyTopic>
		const apiAssertion = (condition: boolean, message: string) => {
			if (!condition) throw new ApiError(500, message)
		}

		// topic
		const makeMyTopic = () => ({
			math: asTopic<MyMeta>()({
				async sum(meta, x: number, y: number) {
					return x + y
				}
			}),
			other: asTopic<MyMeta>()({
				async lol(meta) {}
			})
		})

		const top2 = makeMyTopic()
		top2.other.lol(undefined)

		const policy: PolicyOptions<HttpRequest, HttpResponse, MyAuth, MyMeta> = {
			parseRequest: async request => undefined,
			processAuth: async auth => ({access: {user: {}}}),
			responder: {
				resultResponse: (requestId, result) => ({
					body: "",
					status: 123,
					headers: {"Content-Type": "application/json"},
				}),
				errorResponse: (requestId, error) => ({
					body: "",
					status: 123,
					headers: {"Content-Type": "application/json"},
				}),
			},
		}


		const api2 = makeApi2<HttpRequest, HttpResponse>()({
			topic: makeMyTopic(),
			policy: {
				parseRequest: async request => undefined,
				processAuth: async(auth: MyAuth) => (undefined),
				responder: {
					resultResponse: (requestId, result) => ({
						body: "",
						status: 123,
						headers: {"Content-Type": "application/json"},
					}),
					errorResponse: (requestId, error) => ({
						body: "",
						status: 123,
						headers: {"Content-Type": "application/json"},
					}),
				},
			},
		})

		// const api2 = makeApi2<HttpRequest, HttpResponse>()({
		// 	expose: makeMyTopic(),
		// 	policy: {
		// 		math: policy,
		// 		other: ({
		// 			parseRequest: async request => undefined,
		// 			processAuth: async auth => (undefined),
		// 			responder: {
		// 				resultResponse: (requestId, result) => ({
		// 					body: "",
		// 					status: 123,
		// 					headers: {"Content-Type": "application/json"},
		// 				}),
		// 				errorResponse: (requestId, error) => ({
		// 					body: "",
		// 					status: 123,
		// 					headers: {"Content-Type": "application/json"},
		// 				}),
		// 			},
		// 		}),
		// 	},
		// })

		// shape
		const myShape: ToShape<MyTopic> = {
			math: {sum: true},
			other: {lol: true},
		}

		// serverside api
		const api = makeApi<HttpRequest, HttpResponse, MyAuth, MyMeta>({
			expose: makeMyTopic(),
			responder: makeJsonHttpResponder({headers: {}}),
			parse: parseJsonRequest,
			authorize: async(request, auth) => {
				apiAssertion(
					request.headers["Origin"] == goodOrigin,
					`forbidden origin "${request.headers.origin}"`,
				)
				apiAssertion(
					!!auth.token,
					`invalid token`,
				)
				return {access: {user: {}}}
			},
		})

		// manually execute api
		const directResult = await api(jsonHttpRequest<MyAuth>({
			link: goodLink,
			specifier: "math.sum",
			auth: {token: "a123"},
			args: [2, 3],
			headers: {},
		}))
		assert(directResult, "direct result should be returned")

		// remote execution
		const remote = loopbackJsonRemote<MyAuth, MyTopic>({
			headers: {},
			link: goodLink,
			shape: myShape,
			api,
			getAuth: async() => ({token: "a123"}),
		})
		const remoteResult = await remote.math.sum(2, 3)
		assert(remoteResult === 5, "remote result should be 5")
	},
}