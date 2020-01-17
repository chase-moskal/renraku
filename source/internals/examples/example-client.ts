
import {apiClient} from "../../api-client.js"
import {NuclearApi, nuclearShape} from "./example-common.js"

export async function exampleClient() {
	const {reactor} = apiClient<NuclearApi>({
		url: "http://localhost:8001",
		shape: nuclearShape
	})
	const result = await reactor.generatePower(1, 2)
	console.log(result === 3 ? "✔ success" : "✘ failed")
	return reactor
}
