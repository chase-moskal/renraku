
import type {example as exampleApi} from "./example-api.js"
import {renrakuBrowserClient} from "../http/browser-client.js"

export function makeBrowserRemoteForExample() {
	return renrakuBrowserClient()
		.linkToApiServer("http://localhost:8000/")
		.withMetaMap<typeof exampleApi>({
			greeter: async() => {},
			math: {
				calculator: async() => ({lotto: 9})
			},
		})
}
