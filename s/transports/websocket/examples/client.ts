
import {WebSocketRemote} from "../client.js"
import {exampleClientsideApi, ExampleServersideApi} from "./apis.js"

const url = "http://localhost:8000"
const logger = console

let calls = 0
const api = exampleClientsideApi(() => calls++)

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

