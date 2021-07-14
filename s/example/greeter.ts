
import {apiContext} from "../api/api-context.js"
import {ExampleAuth, ExampleMeta} from "./example-types.js"

export const greeter = apiContext<ExampleMeta, ExampleAuth>()({

	policy: async(meta, request) => ({
		doctorate: meta.token === "yes-has-doctorate",
	}),

	expose: {
		async sayHello(auth, name: string) {
			return auth.doctorate
				? `Hello Dr ${name}, welcome!`
				: `Hi ${name}, what's up?`
		},
		async sayGoodbye(auth, name: string) {
			return auth.doctorate
				? `Goodbye Dr ${name}, see you again soon`
				: `Cya later ${name}`
		},
	},
})
