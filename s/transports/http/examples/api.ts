
import {secure} from "../../../auth/secure.js"

export const example = {

	// unauthenticated service
	unlocked: {
		async sum(a: number, b: number) {
			return a + b
		},
	},

	// authenticated service
	locked: secure(async(auth: string) => {

		if (auth !== "hello")
			throw new Error("invalid auth")

		return {
			async now() {
				return Date.now()
			},
		}
	}),
}

