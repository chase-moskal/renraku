
import {WebSocketClient} from "../client.js"
import {exampleClientsideApi} from "./apis.js"

const url = "http://localhost:8000"
const logger = console
const timeout = 10_000

let calls = 0

const client = await WebSocketClient.connect(url, {
	logger,
	timeout,
	remoteConfig: {
		time: async() => ({preAuth: null}),
	},
	setupLocalEndpoint: remote => (
		exampleClientsideApi(remote.fns, () => calls++).endpoint
	),
	closed: () => {},
})

