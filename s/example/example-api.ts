
import {greeter} from "./greeter.js"
import {asApi} from "../identities/as-api.js"
import {asShape} from "../identities/as-shape.js"
import {_meta} from "../types/symbols/meta-symbol.js"

export const exampleApi = asApi({greeter})

export const exampleShape = (token: string) =>
	asShape<typeof exampleApi>({
		greeter: {
			[_meta]: async() => ({token}),
			sayHello: true,
			sayGoodbye: true,
		},
	})
