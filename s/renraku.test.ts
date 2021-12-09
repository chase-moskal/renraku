
import {expect, Suite} from "cynic"

import {renrakuMock} from "./mocks.js"
import {renrakuApi, renrakuService} from "./service-and-api.js"

export default <Suite>{

	"renrakuMock": {

		async "mock service"() {
			function setup() {
				const calculator = renrakuService()
					.policy(async() => {})
					.expose(() => ({
						async sum(a: number, b: number) {
							return a + b
						},
					}))
				return {
					calculator: renrakuMock()
						.forService(calculator)
						.withMeta(async() => {})
				}
			}
			return {
				async "calling method returns a result"() {
					const {calculator} = setup()
					const result = await calculator.sum(1, 2)
					expect(result).equals(3)
					await expect(async() => (<any>calculator).lol()).throws()
				},
				async "calling missing method throws an error"() {
					const {calculator} = setup()
					await expect(async() => (<any>calculator).lol()).throws()
				},
				async "meta is processed into auth"() {
					const lottoService = renrakuService()
						.policy(async(meta: number) => ({win: meta === 1}))
						.expose(auth => ({
							async isWinner() {
								return auth.win
							},
						}))
					const lotto0 = renrakuMock()
						.forService(lottoService)
						.withMeta(async() => 0)
					const lotto1 = renrakuMock()
						.forService(lottoService)
						.withMeta(async() => 1)
					expect(await lotto0.isWinner()).equals(false)
					expect(await lotto1.isWinner()).equals(true)
				},
			}
		},

		async "mock api"() {
			function setup() {
				const api = renrakuApi({
					greeter: renrakuService()
						.policy(async() => {})
						.expose(() => ({
							async sayHello() {
								return "hello"
							},
						})),
					math: {
						calculator: renrakuService()
							.policy(async() => {})
							.expose(() => ({
								async sum(a: number, b: number) {
									return a + b
								},
							}))
					},
				})
				return {
					api: renrakuMock()
						.forApi(api)
						.withMetaMap({
							greeter: async() => {},
							math: {
								calculator: async() => {},
							},
						})
				}
			}
			return {
				async "calling a method returns a result"() {
					const {api} = setup()
					const result1 = await api.greeter.sayHello()
					const result2 = await api.math.calculator.sum(1, 2)
					expect(result1).equals("hello")
					expect(result2).equals(3)
				},
				async "calling a missing service throws an error"() {
					const {api} = setup()
					await expect(async() => (<any>api).lol()).throws()
					await expect(async() => (<any>api).math.lol()).throws()
				},
				async "calling a missing method throws an error"() {
					const {api} = setup()
					await expect(async() => (<any>api).greeter.lol()).throws()
					await expect(async() => (<any>api).math.calculator.lol()).throws()
				},
				async "metas are processed into auth"() {
					const lottoApi = renrakuApi({
						winnerIs1: renrakuService()
							.policy(async(meta: number) => ({win: meta === 1}))
							.expose(auth => ({
								async isWinner() {
									return auth.win
								},
							})),
						winnerIs2: renrakuService()
							.policy(async(meta: number) => ({win: meta === 2}))
							.expose(auth => ({
								async isWinner() {
									return auth.win
								},
							}))
					})
					const lotto0 = renrakuMock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 0,
							winnerIs2: async() => 0,
						})
					const lotto1 = renrakuMock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 1,
							winnerIs2: async() => 1,
						})
					const lotto2 = renrakuMock()
						.forApi(lottoApi)
						.withMetaMap({
							winnerIs1: async() => 2,
							winnerIs2: async() => 2,
						})
					expect(await lotto0.winnerIs1.isWinner()).equals(false)
					expect(await lotto0.winnerIs2.isWinner()).equals(false)

					expect(await lotto1.winnerIs1.isWinner()).equals(true)
					expect(await lotto1.winnerIs2.isWinner()).equals(false)

					expect(await lotto2.winnerIs1.isWinner()).equals(false)
					expect(await lotto2.winnerIs2.isWinner()).equals(true)
				},
			}
		},
	},
}
