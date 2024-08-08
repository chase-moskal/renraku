
import {Remote} from "../../core/remote.js"
import {PrettyLogger} from "../../tools/logging/pretty-logger.js"
import {WebSocketServer} from "../../transports/websocket/server.js"
import {ExampleClientsideApi, exampleServersideApi} from "./example-apis.js"

const logger = new PrettyLogger()
const serversideApi = exampleServersideApi()

const server = new WebSocketServer({
	logger,
	timeout: 10_000,
	exposeErrors: true,
	maxPayloadSize: 1_000_000,
	endpoint: serversideApi.endpoint,

	acceptConnection: ({remoteEndpoint, close}) => {
		const remote = new Remote<ExampleClientsideApi>(remoteEndpoint, {
			testing: async() => ({preAuth: undefined}),
		})

		// run a quick test
		remote.fns.testing.sum(1, 2).then(result => {
			logger.log("result from client", result)

			// close when test is done
			close()
		})
		return {
			closed: () => {
				logger.log("client disconnected")
			},
		}
	},
})

server.listen(8000, () => {
	console.log("example renraku websocket server is now listening")
})

