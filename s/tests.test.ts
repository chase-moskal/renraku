
import {Suite, assert} from "cynic"

import {apiContext} from "./api/api-context.js"
import {asShape} from "./identities/as-shape.js"
import {asTopic} from "./identities/as-topic.js"
import {toBusiness} from "./transforms/to-business.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"
import {makeJsonHttpServelet} from "./servelet/make-json-http-servelet.js"

import {Augment} from "./types/remote/augment.js"
import {Policy} from "./types/primitives/policy.js"
import {_augment} from "./types/symbols/augment-symbol.js"

const goodLink = "http://localhost:5000/"
const {origin: goodOrigin} = new URL(goodLink)

export default <Suite>{
	"make a servelet and execute a loopback procedure": async() => {
		type AlphaMeta = {token: string}
		type AlphaAuth = {access: boolean}

		type BravoMeta = {abc: string}
		type BravoAuth = {tables: boolean}

		const alpha = asTopic<AlphaAuth>()({
			async sum(auth, x: number, y: number) {
				return x + y
			},
		})

		const bravo = asTopic<BravoAuth>()({
			async divide(auth, x: number, y: number) {
				return x / y
			},
		})

		const alphaPolicy: Policy<AlphaMeta, AlphaAuth> = {
			processAuth: async (meta, request) => ({access: true})
		}

		const bravoPolicy: Policy<BravoMeta, BravoAuth> = {
			processAuth: async (meta, request) => ({tables: true})
		}

		const createContext = () => ({
			alpha: apiContext<AlphaMeta, AlphaAuth>()({
				policy: alphaPolicy,
				expose: alpha,
			}),
			bravo: apiContext<BravoMeta, BravoAuth>()({
				policy: bravoPolicy,
				expose: bravo,
			}),
			group: {
				alpha2: apiContext<AlphaMeta, AlphaAuth>()({
					policy: alphaPolicy,
					expose: alpha,
				})
			},
		})

		type MyContext = ReturnType<typeof createContext>

		////////

		const alphaAugment: Augment<AlphaMeta> = {
			getMeta: async() => ({token: "t123"})
		}

		const bravoAugment: Augment<BravoMeta> = {
			getMeta: async() => ({abc: "abc"})
		}

		const myShape = asShape<MyContext>({
			alpha: {
				[_augment]: alphaAugment,
				sum: true,
			},
			bravo: {
				[_augment]: bravoAugment,
				divide: true,
			},
			group: {
				alpha2: {
					[_augment]: alphaAugment,
					sum: true,
				}
			},
		})

		////////

		const servelet = makeJsonHttpServelet(createContext())

		const r0 = await servelet(jsonHttpRequest({
			link: goodLink,
			meta: <AlphaMeta>{token: "t123"},
			headers: {},
			specifier: "alpha.sum",
			args: [1, 2],
		}))

		assert(r0.status === 200, "direct servelet request status not 200")

		const myRemote = loopbackJsonRemote({
			servelet,
			link: goodLink,
			shape: myShape,
			headers: {origin: "http://localhost:5000"},
		})

		const r1 = await myRemote.alpha.sum(1, 2)
		const r2 = await myRemote.group.alpha2.sum(2, 3)

		assert(r1 === 3, "r1 must be 3")
		assert(r2 === 5, "r2 must be 5")

		////////

		const mockAlpha = toBusiness<AlphaAuth>()({
			topic: alpha,
			getAuth: async() => ({access: true}),
		})

		const m1 = await mockAlpha.sum(4, 5)
		assert(m1, "m1 must be 9")
	},
}
