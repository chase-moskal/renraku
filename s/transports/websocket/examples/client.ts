
import {webSocketRemote} from "../client.js"
import {expose} from "../../../core/expose.js"
import {exampleClientsideApi, ExampleServersideFns} from "./apis.js"

let calls = 0
let rememberCall = () => calls++

const {socket, remote: serverside} = await webSocketRemote<ExampleServersideFns>({
	url: "http://localhost:8000",
	getLocalEndpoint: serverside => expose(exampleClientsideApi(serverside, rememberCall)),
})

const result = await serverside.now()
socket.close()

if (typeof result === "number" && calls === 1)
	console.log("✅ websocket call works", result, calls)
else
	console.error("🟥 websocket call failed", result, calls)
