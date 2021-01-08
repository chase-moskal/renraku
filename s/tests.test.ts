
import {Suite, assert} from "cynic"

// // import {makeApi, makeApi2, PolicyOptions, ToPolicy, asPolicy} from "./api/make-api.js"
// import {ApiError} from "./api/api-error.js"
// // import {ToShape} from "./types/primitives/to-shape.js"
// import {HttpRequest} from "./types/http/http-request.js"
// import {HttpResponse} from "./types/http/http-response.js"
// import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
// // import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"
// import {makeJsonHttpResponder} from "./jsonrpc/json-http-responder.js"
// // import {JsonRpcId} from "./types/jsonrpc/json-rpc-id.js"

import {asTopic} from "./identities/as-topic.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import { makeJsonHttpResponder } from "./jsonrpc/json-http-responder.js"
import {parseJsonRequest} from "./jsonrpc/parse-json-request.js"
import { loopbackJsonRemote } from "./remote/loopback-json-remote"
import { makeServelet } from "./api/make-servelet"
import { ToShape } from "./types/shape/to-shape"
import { Gravy } from "./types/remote/gravy"
import { Policy } from "./types/primitives/policy"
import { prepareJsonApi } from "./prepare-json-api.js"
import { _gravy } from "./types/symbols/gravy-symbol.js"

const goodLink = "http://localhost:5000/"
const {origin: goodOrigin} = new URL(goodLink)

export default <Suite>{
	"make a servelet and execute a loopback procedure": async() => {
		type AlphaAuth = {token: string}
		type AlphaMeta = {access: boolean}

		type BravoAuth = {abc: string}
		type BravoMeta = {tables: boolean}

		const alpha = asTopic<AlphaMeta>()({
			async sum(meta, x: number, y: number) {
				return x + y
			},
		})

		const bravo = asTopic<BravoMeta>()({
			async divide(meta, x: number, y: number) {
				return x / y
			},
		})

		const alphaPolicy: Policy<AlphaAuth, AlphaMeta> = {
			processAuth: async auth => undefined
		}

		const bravoPolicy: Policy<BravoAuth, BravoMeta> = {
			processAuth: async auth => undefined
		}

		const createContext = () => ({
			alpha: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha),
			bravo: prepareJsonApi<BravoAuth, BravoMeta>()(bravoPolicy, bravo),
			group: {
				alpha2: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha)
			},
		})

		type MyContext = ReturnType<typeof createContext>

		////////

		const alphaGravy: Gravy<AlphaAuth> = {
			getAuth: async() => ({token: "t123"})
		}

		const bravoGravy: Gravy<BravoAuth> = {
			getAuth: async() => ({abc: "abc"})
		}

		const myShape: ToShape<MyContext> = {
			alpha: {
				[_gravy]: alphaGravy,
				sum: true,
			},
			bravo: {
				[_gravy]: bravoGravy,
				divide: true,
			},
			group: {
				alpha2: {
					[_gravy]: alphaGravy,
					sum: true,
				}
			},
		}

		////////

		const servelet = makeServelet({
			expose: createContext(),
			responder: makeJsonHttpResponder({headers: {}}),
			parseRequest: parseJsonRequest,
		})

		const r0 = await servelet(jsonHttpRequest({
			link: goodLink,
			auth: <AlphaAuth>{token: "t123"},
			headers: {},
			specifier: "alpha.sum",
			args: [1, 2],
		}))

		assert(r0.status === 200, "direct servelet request status not 200")

		const myRemote = loopbackJsonRemote({
			link: goodLink,
			servelet,
			shape: myShape,
		})

		const r1 = await myRemote.alpha.sum(1, 2)
		const r2 = await myRemote.group.alpha2.sum(2, 3)

		assert(r1 === 3, "r1 must be 3")
		assert(r2 === 5, "r2 must be 5")
	},
}
