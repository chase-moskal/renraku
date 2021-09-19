
import {Suite, assert} from "cynic"

import {apiContext} from "./api/api-context.js"
import {asShape} from "./identities/as-shape.js"
import {asTopic} from "./identities/as-topic.js"
import {mockRemote} from "./remote/mock-remote.js"
import {toBusiness} from "./transforms/to-business.js"
import {mockHttpRequest} from "./remote/mock-http-request.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {loopbackJsonRemote} from "./remote/loopback-json-remote.js"
import {noServeletLogger} from "./servelet/logger/no-servelet-logger.js"
import {makeJsonHttpServelet} from "./servelet/make-json-http-servelet.js"

import {Augment} from "./types/remote/augment.js"
import {Policy} from "./types/primitives/policy.js"
import {_meta} from "./types/symbols/meta-symbol.js"

const goodLink = "http://localhost:5000/"

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

		const alphaPolicy: Policy<AlphaMeta, AlphaAuth> =
			async(meta, request) => ({access: true})

		const bravoPolicy: Policy<BravoMeta, BravoAuth> =
			async(meta, request) => ({tables: true})

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

		const alphaAugment: Augment<AlphaMeta> = async() => ({token: "t123"})
		const bravoAugment: Augment<BravoMeta> = async() => ({abc: "abc"})

		const myShape = asShape<MyContext>({
			alpha: {
				[_meta]: alphaAugment,
				sum: true,
			},
			bravo: {
				[_meta]: bravoAugment,
				divide: true,
			},
			group: {
				alpha2: {
					[_meta]: alphaAugment,
					sum: true,
				}
			},
		})

		////////

		const servelet = makeJsonHttpServelet(createContext(), noServeletLogger())

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
	async "mock remotes work"() {
		let successCount = 0

		const valid = true
		const invalid = false

		type Meta = {metaTest: boolean}
		type Auth = {authTest: boolean}

		const context = apiContext<Meta, Auth>()({
			async policy(meta) {
				return {authTest: meta.metaTest ? valid : invalid}
			},
			expose: {
				async lol({authTest}, argTest: boolean) {
					if (authTest === valid && argTest === valid)
						successCount += 1
				},
			},
		})

		const remote1 = mockRemote(context).forceAuth({authTest: valid})
		await remote1.lol(valid)
		assert(successCount === 1, "mock remote forceAuth call should succeed")

		const remote2 = mockRemote(context).withMeta({
			meta: {metaTest: true},
			request: mockHttpRequest({origin: "example.com"}),
		})
		await remote2.lol(valid)
		assert(successCount === 2, "mock remote withMeta call should succeed")
	},
}
