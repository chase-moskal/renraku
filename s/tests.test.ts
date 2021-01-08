
import {Suite, assert} from "cynic"

import {apiContext} from "./api/api-context.js"
import {asShape} from "./identities/as-shape.js"
import {asTopic} from "./identities/as-topic.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {makeJsonServelet} from "./servelet/make-json-servelet.js"
import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"

import {Augment} from "./types/remote/augment.js"
import {Policy} from "./types/primitives/policy.js"
import {_augment} from "./types/symbols/augment-symbol.js"

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
			alpha: apiContext<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha),
			bravo: apiContext<BravoAuth, BravoMeta>()(bravoPolicy, bravo),
			group: {
				alpha2: apiContext<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha)
			},
		})

		type MyContext = ReturnType<typeof createContext>

		////////

		const alphaAugment: Augment<AlphaAuth> = {
			getAuth: async() => ({token: "t123"})
		}

		const bravoAugment: Augment<BravoAuth> = {
			getAuth: async() => ({abc: "abc"})
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

		const servelet = makeJsonServelet(createContext())

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
