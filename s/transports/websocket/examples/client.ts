//
// import {WebSocketRemote} from "../client.js"
// import {exampleClientsideApi, ExampleServersideApi, exampleServersideRemoteConfig} from "./apis.js"
//
// let calls = 0
//
// const client = new WebSocketRemote<ExampleServersideApi>({
// 	timeout: 10_000,
// 	exposeErrors: true,
// 	url: "http://localhost:8000",
// 	remoteConfig: exampleServersideRemoteConfig(),
// })
//
// await client.finalize(exampleClientsideApi(client.fns, () => calls++))
//
// const result = await client.fns.time.now()
//
// if (typeof result === "number" && calls === 1)
// 	console.log("✅ websocket call works", result, calls)
// else
// 	console.error("🟥 websocket call failed", result, calls)
//
// client.close()
//
