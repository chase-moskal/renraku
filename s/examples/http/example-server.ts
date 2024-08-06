
import {exampleApi} from "./example-api.js"
import {HttpServer} from "../../transports/http/server.js"

const {endpoint} = exampleApi()

const server = new HttpServer({
	endpoint,
	logger: console,
	exposeErrors: false,
	maxPayloadSize: 1_000_000,
})

server.listen(8000, () => {
	console.log("example renraku server is now listening")
})

