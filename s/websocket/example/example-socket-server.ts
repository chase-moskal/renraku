
import {megabytes} from "../../renraku.js"
import {renrakuWebSocketServer} from "../socket-server.js"
import {clientsideApi, makeServersideApi} from "./example-socket-apis.js"

renrakuWebSocketServer({
	port: 8001,
	exposeErrors: false,
	maxPayloadSize: megabytes(10),
	acceptConnection: ({controls, prepareClientApi}) => ({
		handleConnectionClosed() {},
		api: makeServersideApi(
			controls,
			prepareClientApi<typeof clientsideApi>({
				clientService: async() => {},
			}),
		),
	}),
})
