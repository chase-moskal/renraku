
import {renrakuApi, renrakuService} from "../../renraku.js"

export const example = renrakuApi({
	greeter: (renrakuService()
		.policy(async() => {})
		.expose(auth => ({
			async sayHello() {
				return "hello"
			},
		}))
	),
	math: {
		calculator: (renrakuService()
			.policy(async(meta: {lotto: number}) => ({winner: meta.lotto === 9}))
			.expose(auth => ({
				async sum(a: number, b: number) {
					return a + b
				},
				async isWinner() {
					return auth.winner
				},
			}))
		)
	},
})
