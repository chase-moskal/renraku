
import {api} from "../../../core/types.js"
import {requireAuth} from "../../../auth/require.js"

export type ExampleApi = typeof exampleApi

export const exampleApi = api(() => ({

	// unauthenticated service
	unlocked: {
		async sum(a: number, b: number) {
			return a + b
		},
	},

	// authenticated service
	locked: requireAuth(async(auth: string) => {

		if (auth !== "hello")
			throw new Error("invalid auth")

		return {
			async now() {
				return Date.now()
			},
		}
	}),
}))

