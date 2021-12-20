
import {exampleApi} from "./example-api.js"
import {renrakuNodeServer} from "../node-server.js"
import {megabytes} from "../../renraku.js"

const server = renrakuNodeServer({
	api: exampleApi,
	exposeErrors: true,
	maxPayloadSize: megabytes(10),
})

server.listen(8000)
