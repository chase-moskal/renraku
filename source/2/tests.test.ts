
import {Suite, assert} from "cynic"

import {makeApi} from "./api/make-api.js"
import {asTopic} from "./identities/as-topic.js"
import {parseJsonRpc} from "./jsonrpc/parse-json-rpc.js"
import {ToShape} from "./types/augmentations/to-shape.js"
import {jsonRpcResponder} from "./jsonrpc/json-rpc-responder.js"
import {JsonRpcRequest} from "./types/jsonrpc/json-rpc-request.js"

const originGood = "http://localhost:5000"

export default <Suite>{
	"make an api and execute a procedure": async() => {
		type MyAuth = {token: string}
		type MyMeta = {access: {user: {}}}
		type MyTopic = ReturnType<typeof makeMyTopic>

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
		const api = makeApi<MyAuth, MyMeta>({
			topic: makeMyTopic(),
			parse: parseJsonRpc,
			authorize: async(request, auth) => {
				if (request.headers.origin !== originGood)
					throw new Error(`forbidden origin "${request.headers.origin}"`)
				return {access: {user: {}}}
			},
			responder: jsonRpcResponder(),
		})

		// serverside execute api procedure
		const result = await api({
			body: JSON.stringify(<JsonRpcRequest>{
				jsonrpc: "2.0",
				method: "math.sum",
				params: [<MyAuth>{token: "a123"}, 2, 3],
			}),
			headers: {origin: originGood},
		})

		assert(result, "result should be returned")
	},
}
