
import type {exampleApi} from "./example-api.js"
import {renrakuBrowserClient} from "../browser-client.js"

export function makeBrowserRemoteForExample() {
	return renrakuBrowserClient<typeof exampleApi>({
		url: "http://localhost:8000/",
		metaMap: {
			greeter: async() => {},
			math: {
				calculator: async() => ({lotto: 9})
			},
		},
	})
}
