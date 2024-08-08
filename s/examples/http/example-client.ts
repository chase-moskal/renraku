
import type {ExampleApi} from "./example-api.js"
import {HttpRemote} from "../../transports/http/client.js"

const url = "http://localhost:8000"

const client = new HttpRemote<ExampleApi>(url, {
	time: async() => ({preAuth: undefined}),
})

console.log(await client.fns.time.now())

