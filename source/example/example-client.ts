
import {NuclearApi, nuclearShape} from "./example-common.js"
import {createBrowserApiClient} from "../client/create-browser-api-client.js"

export async function exampleClient() {
	const {reactor} = await createBrowserApiClient<NuclearApi>({
		url: "http://localhost:8001",
		shape: nuclearShape
	})
	const result = await reactor.methods.generatePower(1, 2)
	console.log(result === 3 ? "✔ success" : "✘ failed")
	return reactor
}
