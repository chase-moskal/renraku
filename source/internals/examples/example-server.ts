
import {apiServer, simpleApi} from "../../api-server.js"
import {makeNuclearApi} from "./example-common.js"

export async function exampleServer() {
	const api = makeNuclearApi()
	const server2 = await apiServer({expose: simpleApi(api)})
	server2.start(8001)
}
