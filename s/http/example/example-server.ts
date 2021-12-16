
import {exampleApi} from "./example-api.js"
import {renrakuNodeServer} from "../node-server.js"

const server = renrakuNodeServer({
	api: exampleApi,
	exposeErrors: true,
})

server.listen(8000)
