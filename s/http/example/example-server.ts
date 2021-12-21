
import {exampleApi} from "./example-api.js"
import {nodeServer} from "../node-server.js"
import {megabytes} from "../../renraku.js"

const server = nodeServer({
	api: exampleApi,
	exposeErrors: true,
	maxPayloadSize: megabytes(10),
})

server.listen(8000)
