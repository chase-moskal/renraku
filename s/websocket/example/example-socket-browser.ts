
import {renrakuWebSocketClient} from "../socket-client.js"
import {clientsideApi, makeServersideApi} from "./example-socket-apis.js"

export function makeExampleSocketClient() {
	return renrakuWebSocketClient<ReturnType<typeof makeServersideApi>>({
		link: "ws://localhost:8001",
		clientApi: clientsideApi,
		handleConnectionClosed() {},
		metaMap: {
			serverService: async() => {},
		},
	})
}
