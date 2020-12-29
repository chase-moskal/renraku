
import {apiServer} from "../../api-server.js"
import {serverizeApi} from "../../curries.js"

import {makeNuclearApi} from "./example-common.js"

export async function exampleServer() {

	const server = await apiServer({
		expose: serverizeApi(
			async() => async(result) => ({result}),
			makeNuclearApi(),
		)
	})

	server.start(8001)
}
