
import {WebSocketServer} from "../server.js"
import {remote} from "../../../core/remote.js"
import {logger} from "../../../logging/logger.js"
import {endpoint} from "../../../core/endpoint.js"
import {ExampleClientsideFns, exampleServersideApi} from "./apis.js"

const server = new WebSocketServer({
	acceptConnection: async({remoteEndpoint}) => {
		const clientside = remote<ExampleClientsideFns>(remoteEndpoint)
		return {
			closed: () => {},
			localEndpoint: endpoint(
				exampleServersideApi(clientside),
			),
		}
	},
})

server.listen(8000, () => logger.logcore.log("example websocket server listening..."))

