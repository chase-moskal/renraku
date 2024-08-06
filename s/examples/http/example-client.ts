
import type {ExampleApi} from "./example-api.js"
import {HttpClient} from "../../transports/http/client.js"

const url = "http://localhost:8000"

const client = new HttpClient<ExampleApi>(url, {
	time: async() => ({preAuth: undefined}),
})

console.log(await client.fns.time.now())

