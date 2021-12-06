
import {renrakuNodeServer} from "./http/node-server.js"
import {renrakuMock, renrakuApi, RenrakuRemote, renrakuBrowserClient} from "./renraku.js"

const lol = renrakuApi(renrakuService => ({
	a: {
		b: {
			c: {
				d: {
					e: {
						f: {
							g: {
								h: {
									i: {
										j: renrakuService()
											.policy(async(meta: {lotto: number}) => ({winner: meta.lotto}))
											.expose(auth => ({
												async lmao() {},
											}))
									},
								}
							}
						}
					}
				}
			},
		},
	},
}))

let lol2: RenrakuRemote<typeof lol>
lol2.a.b.c.d.e.f.g.h.i.j.lmao()

const geniusApi = renrakuApi(renrakuService => ({
	math: {
		calculator: renrakuService()
			.policy(async(meta: {lotto: number}) => ({winner: meta.lotto === 9}))
			.expose(auth => ({
				async sum(x: number, y: number) {
					return x + y
				},
			})),
	},
}))

const remoteCalculator1 = renrakuMock()
	.forService(geniusApi.math.calculator)
	.withMeta(async() => ({lotto: 9}))

const remoteCalculator2 = renrakuMock()
	.forService(geniusApi.math.calculator)
	.withAuth(async() => ({winner: true}))

const remoteGenius1 = renrakuMock()
	.forApi(geniusApi)
	.withMetaMap({
		math: {
			calculator: async() => ({lotto: 9}),
		},
	})

const remoteGenius2 = renrakuMock()
	.forApi(geniusApi)
	.withAuthMap({
		math: {
			calculator: async() => ({winner: true}),
		},
	})

const server = renrakuNodeServer()
	.exposeErrors(false)
	.forApi(geniusApi)
	.listen(8000)

const geniusClient = renrakuBrowserClient()
	.linkToApiServer("https://api.xiome.io/")
	.withMetaMap<typeof geniusApi>({
		math: {
			calculator: async() => ({lotto: 5}),
		},
	})

async function myBusinessLogic({genius, calculator}: {
		genius: RenrakuRemote<typeof geniusApi>
		calculator: RenrakuRemote<typeof geniusApi["math"]["calculator"]>
	}) {
	const a = await genius.math.calculator.sum(1, 2)
	const b = await calculator.sum(2, 3)
}
