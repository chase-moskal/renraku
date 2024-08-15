
// import {WebSocketServer} from "../server.js"
// import {Remote} from "../../../core/remote.js"
// import {PrettyLogger} from "../../../tools/logging/pretty-logger.js"
// import {ExampleClientsideApi, exampleClientsideRemoteConfig, exampleServersideApi} from "./apis.js"
//
// const logger = new PrettyLogger()
//
// const server = new WebSocketServer({
// 	logger,
// 	timeout: 10_000,
// 	exposeErrors: true,
// 	maxPayloadSize: 1_000_000,
//
// 	acceptConnection: ({remoteEndpoint}) => {
// 		const remote = new Remote<ExampleClientsideApi>(
// 			remoteEndpoint,
// 			exampleClientsideRemoteConfig(),
// 		)
//
// 		return {
// 			localApi: exampleServersideApi(remote.fns),
// 			closed: () => logger.log("client disconnected"),
// 		}
// 	},
// })
//
// server.listen(8000, () => {
// 	console.log("example renraku websocket server is now listening")
// })
//
