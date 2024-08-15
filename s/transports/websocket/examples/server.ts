
import {Api} from "../../../core/types.js"
import {WebSocketServer} from "../server.js"
import {remote} from "../../../core/remote.js"
import {expose} from "../../../core/expose.js"
import {ExampleClientsideFns, exampleServersideApi} from "./apis.js"
import {PrettyLogger} from "../../../tools/logging/pretty-logger.js"

const logger = new PrettyLogger()

const server = new WebSocketServer({
	logger,
	timeout: 10_000,
	exposeErrors: true,
	maxPayloadSize: 1_000_000,

	acceptConnection: ({remoteEndpoint}) => {
		const clientside = remote<Api<ExampleClientsideFns>>(remoteEndpoint)
		return {
			closed: () => {},
			localEndpoint: expose(exampleServersideApi(clientside)),
		}
	},
})

server.listen(8000, () => console.log("example websocket server listening..."))

