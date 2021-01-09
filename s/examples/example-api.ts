
import {apiContext} from "../api/api-context.js"
import {asShape} from "../identities/as-shape.js"
import {asTopic} from "../identities/as-topic.js"
import {asApiGroup} from "../identities/as-api-group.js"
import {_augment} from "../types/symbols/augment-symbol.js"

// exposed api functionality
export const greeterTopic = asTopic<ExampleMeta>()({
	async sayHello(meta, name: string) {
		if (meta.doctorate) return `Hello Dr. ${name}, welcome!`
		else return `Hello ${name}, welcome!`
	}
})

// auth data sent with every request
export interface ExampleAuth {
	token: string
}

// processed data that the policy derives from the auth data
export interface ExampleMeta {
	doctorate: boolean
}

// api configured with an auth policy
export const exampleApi = () => asApiGroup({
	greeter: apiContext<ExampleAuth, ExampleMeta>()({
		expose: greeterTopic,
		policy: {processAuth: async auth => ({doctorate: auth.token === "abc"})},
	})
})

// shape for generating remotes specifies auth
export const exampleShape = asShape<ReturnType<typeof exampleApi>>({
	greeter: {
		[_augment]: {getAuth: async() => ({token: "abc"})},
		sayHello: true,
	}
})
