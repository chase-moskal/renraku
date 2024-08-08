
import {exampleClientsideApi, ExampleServersideApi} from "./example-apis.js"
import {WebSocketRemote} from "../../transports/websocket/client.js"

const logger = console
const api = exampleClientsideApi()
const url = "http://localhost:8000"

const remote = await WebSocketRemote.connect<ExampleServersideApi>(url, {
	closed: () => logger.log("disconnected by server"),
	endpoint: api.endpoint,
	logger,
	timeout: 10_000,
	remoteConfig: {
		time: async() => ({preAuth: undefined}),
	},
})

console.log(await remote.fns.time.now())

