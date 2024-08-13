
import {WebSocketServer} from "../server.js"
import {Remote} from "../../../core/remote.js"
import {PrettyLogger} from "../../../tools/logging/pretty-logger.js"
import {ExampleClientsideApi, exampleServersideApi} from "./apis.js"

const logger = new PrettyLogger()

const server = new WebSocketServer({
	logger,
	timeout: 10_000,
	exposeErrors: true,
	maxPayloadSize: 1_000_000,

	acceptConnection: ({remoteEndpoint, close}) => {
		const remote = new Remote<ExampleClientsideApi>(remoteEndpoint, {
			maths: async() => ({preAuth: null}),
		})

		// run a quick test
		remote.fns.maths.sum(1, 2).then(result => {
			logger.log("result from client", result)

			// close when test is done
			close()
		})

		return {
			localEndpoint: exampleServersideApi(remote.fns).endpoint,
			closed: () => {
				logger.log("client disconnected")
			},
		}
	},
})

server.listen(8000, () => {
	console.log("example renraku websocket server is now listening")
})

