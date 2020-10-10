
import {apiServer, simpleServerApi} from "../../api-server.js"
import {uncurryApiAugmentation, uncurryMethodAugmentation} from "../../curries.js"

import {makeNuclearApi} from "./example-common.js"

export async function exampleServer() {
	const api = makeNuclearApi()

	const {generatePower} = api.reactor
	const generatePower2 = uncurryMethodAugmentation(
		async() => async(result) => ({result}),
		api.reactor.generatePower,
	)

	const expose = uncurryApiAugmentation(
		async() => async(result) => ({result}),
		api,
	)
	// expose.reactor.generatePower

	const server = await apiServer({expose})
	server.start(8001)
}
