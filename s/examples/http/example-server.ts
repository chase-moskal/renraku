
import {exampleApi} from "./example-api.js"
import {HttpServer} from "../../transports/http/server.js"
import {PrettyLogger} from "../../tools/logging/pretty-logger.js"

const {endpoint} = exampleApi()

const server = new HttpServer({
	endpoint,
	exposeErrors: false,
	maxPayloadSize: 1_000_000,
	logger: new PrettyLogger(),
})

server.listen(8000, () => {
	console.log("example renraku server is now listening")
})

