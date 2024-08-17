
import {WebSocketServer} from "../server.js"
import {remote} from "../../../core/remote.js"
import {expose} from "../../../core/expose.js"
import {ExampleClientsideFns, exampleServersideApi} from "./apis.js"

const server = new WebSocketServer({
	acceptConnection: ({remoteEndpoint}) => {
		const clientside = remote<ExampleClientsideFns>(remoteEndpoint)
		return {
			closed: () => {},
			localEndpoint: expose(exampleServersideApi(clientside)),
		}
	},
})

server.listen(8000, () => console.log("example websocket server listening..."))

