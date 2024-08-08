
import {HttpRemote} from "../client.js"
import type {ExampleApi} from "./api.js"

const url = "http://localhost:8000"

const client = new HttpRemote<ExampleApi>(url, {
	time: async() => ({preAuth: undefined}),
})

console.log(await client.fns.time.now())

