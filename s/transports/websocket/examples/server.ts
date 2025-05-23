
import {WebSocketServer} from "../server.js"
import {remote} from "../../../core/remote.js"
import {logger} from "../../../tools/logger.js"
import {endpoint} from "../../../core/endpoint.js"
import {ExampleClientsideFns, exampleServersideApi} from "./apis.js"

logger.enable()

const server = new WebSocketServer({
	acceptConnection: async connection => {
		const personalLogger = logger.personal(connection)
		const clientside = remote<ExampleClientsideFns>(
			connection.remoteEndpoint,
			personalLogger.remote,
		)
		return {
			closed: () => {},
			localEndpoint: endpoint(
				exampleServersideApi(clientside),
				personalLogger.local,
			),
		}
	},
})

server.listen(8000, () => logger.log("example websocket server listening..."))

