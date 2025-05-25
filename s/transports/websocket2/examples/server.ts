
import {webSocketServer} from "../server.js"
import {exampleServersideApi} from "./apis.js"
import {ExampleClientsideFns} from "./types.js"
import {LoggerTap} from "../../../tools/logger.js"

export const logger = new LoggerTap()

await webSocketServer<ExampleClientsideFns>({
	port: 8000,
	tap: logger,
	accept: async connection => exampleServersideApi(connection.clientside),
})

await logger.log("example websocket server listening...")

