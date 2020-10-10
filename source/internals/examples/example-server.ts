
import {apiServer, simpleServerApi} from "../../api-server.js"
import {serverizeApi, serverize, serverizeTopic} from "../../curries.js"

import {makeNuclearApi} from "./example-common.js"

export async function exampleServer() {
	const api = makeNuclearApi()
	api.reactor.generatePower

	const generatePower2 = serverize(
		async() => async(result) => ({result}),
		api.reactor.generatePower,
	)

	const lol = serverizeTopic(
		async() => async(result) => ({result}),
		api.reactor,
	)
	lol.generatePower

	const expose = serverizeApi(
		async() => async(result) => ({result}),
		api,
	)
	expose.reactor.generatePower

	const server = await apiServer({expose})
	server.start(8001)
}
