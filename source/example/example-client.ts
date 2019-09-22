
import {ApiShape} from "../interfaces.js"
import {NuclearApi} from "./example-server.js"
import {createBrowserApiClient} from "../client/create-browser-api-client.js"

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		generatePower: true,
		radioactiveMeltdown: true
	}
}

export async function exampleClient() {
	const {reactor} = await createBrowserApiClient<NuclearApi>({
		url: "http://localhost:8001",
		shape: nuclearShape
	})
	const result = await reactor.generatePower(1, 2)
	console.log(result === 3 ? "✔ success" : "✘ failed")
	return reactor
}
