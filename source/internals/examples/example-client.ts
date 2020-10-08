
import {apiClient} from "../../api-client.js"
import {curryApiMeta, curryApiAugmentation} from "../../curries.js"
import {NuclearApi, nuclearShape, NuclearMeta} from "./example-common.js"

import {ApiToClientside} from "../../types.js"

type NuclearApiClientside = ApiToClientside<NuclearApi>
let lol: NuclearApiClientside

export async function exampleClient() {

	const client = await apiClient<ApiToClientside<NuclearApi>>({
		shape: nuclearShape,
		url: "http://localhost:8001",
	})

	const client2 = curryApiAugmentation(
		async() => ({headers: {}}),
		async(response) => response.result,
		client,
	)

	const client3 = curryApiMeta<NuclearApi, NuclearMeta>(
		async() => ({accessToken: "a123"}),
		client2,
	)

	// now consumers can call methods without the meta arg!
	const result = await client3.reactor.generatePower(1, 2)

	console.log(result === 3 ? "✔ success" : "✘ failed")
	return client3
}
