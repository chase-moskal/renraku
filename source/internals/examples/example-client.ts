
import {curryApiMeta} from "../../curries.js"
import {ApiToClientside} from "../../types.js"
import {apiClient, simpleClientApi} from "../../api-client.js"

import {NuclearApi, nuclearShape, NuclearMeta} from "./example-common.js"

export async function exampleClient() {

	const client = curryApiMeta<NuclearApi, NuclearMeta>(
		async() => ({accessToken: "a123"}),
		simpleClientApi(
			await apiClient<ApiToClientside<NuclearApi>>({
				shape: nuclearShape,
				url: "http://localhost:8001",
			})
		)
	)

	// now consumers can call methods without the meta arg!
	const result = await client.reactor.generatePower(1, 2)

	console.log(result === 3 ? "✔ success" : "✘ failed")
	return client
}
