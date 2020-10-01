
import {apiClient} from "../../api-client.js"
import {curryApiMeta} from "../../curries.js"
import {NuclearApi, nuclearShape, NuclearMeta} from "./example-common.js"

export async function exampleClient() {

	// generate a nuclear api client interface
	// but we curry-in the meta argument
	const api = curryApiMeta<NuclearApi, NuclearMeta>(
		await apiClient({
			shape: nuclearShape,
			url: "http://localhost:8001",
		}),
		async() => ({accessToken: "a123"}),
	)

	// now consumers can call methods without the meta arg!
	const result = await api.reactor.generatePower(1, 2)

	console.log(result === 3 ? "✔ success" : "✘ failed")
	return api
}
