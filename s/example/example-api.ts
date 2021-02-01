
import {asApi} from "../identities/as-api.js"
import {apiContext} from "../api/api-context.js"
import {asShape} from "../identities/as-shape.js"
import {asTopic} from "../identities/as-topic.js"
import {_augment} from "../types/symbols/augment-symbol.js"

// exposed api functionality
export const greeterTopic = asTopic<ExampleAuth>()({

	async sayHello(auth, name: string) {
		if (auth.doctorate) return `Hello Dr. ${name}, welcome!`
		else return `Hello ${name}, welcome!`
	},

	async sayGoodbye(auth, name: string) {
		if (auth.doctorate) return `Goodbye Dr. ${name}, see you later.`
		else return `Goodbye ${name}, see you later.`
	},
})

// meta data sent with every request
export interface ExampleMeta {
	token: string
}

// processed data that the policy derives from the meta data
export interface ExampleAuth {
	doctorate: boolean
}

// api configured with an meta policy
export const exampleApi = () => asApi({
	greeter: apiContext<ExampleMeta, ExampleAuth>()({
		expose: greeterTopic,
		policy: {processAuth: async (meta, request) => ({doctorate: meta.token === "abc"})},
	})
})

// shape for generating remotes specifies meta
export const exampleShape = asShape<ReturnType<typeof exampleApi>>({
	greeter: {
		[_augment]: {getMeta: async() => ({token: "abc"})},
		sayHello: true,
		sayGoodbye: true,
	}
})
