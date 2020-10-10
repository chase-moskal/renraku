
import {addMetaApi, declientizeApi} from "../../curries.js"
import {Clientize, DeclientizeApi, ServerResponse} from "../../types.js"
import {apiClient, simpleClientApi} from "../../api-client.js"

import {NuclearApi, nuclearShape, NuclearMeta} from "./example-common.js"

export async function exampleClient() {

	const api =await apiClient<Clientize<NuclearApi>>({
		shape: nuclearShape,
		url: "http://localhost:8001",
	})

	const api2 = declientizeApi(
		async() => ({}),
		async(response: ServerResponse<any>) => response.result,
		api,
	)

	const api3 = addMetaApi(
		async() => ({accessToken: "a123"}),
		api2,
	)

	// now consumers can call methods without the meta arg!
	api.reactor.generatePower
	api2.reactor.generatePower
	const result = await api3.reactor.generatePower(1, 2)

	console.log(result === 3 ? "✔ success" : "✘ failed")
	return api3
}
