
import {webSocketRemote} from "../client.js"
import {endpoint} from "../../../core/endpoint.js"
import {exampleClientsideApi, ExampleServersideFns} from "./apis.js"

let calls = 0
let rememberCall = () => calls++

const {socket, fns: serverside} = await webSocketRemote<ExampleServersideFns>({
	url: "http://localhost:8000",
	getLocalEndpoint: fns => endpoint(exampleClientsideApi(fns, rememberCall)),
})

const result = await serverside.now()
socket.close()

if (typeof result === "number" && calls === 1)
	console.log("✅ websocket call works", result, calls)
else
	console.error("🟥 websocket call failed", result, calls)

