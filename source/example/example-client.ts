
import {NuclearApi} from "./example-server.js"
import {createBrowserApiClient} from "../client/create-browser-api-client.js"

export async function exampleClient() {
	const {reactor} = await createBrowserApiClient<NuclearApi>({
		url: "http://localhost:8001",
		shape: {
			reactor: {
				methods: {
					generatePower: true,
					radioactiveMeltdown: true
				}
			}
		}
	})
	const result = await reactor.methods.generatePower(1, 2)
	console.log(result === 3 ? "✔ success" : "✘ failed")
	return reactor
}
