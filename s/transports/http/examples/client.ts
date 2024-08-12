
import {HttpRemote} from "../client.js"
import type {ExampleApi} from "./api.js"

const url = "http://localhost:8000"

const client = new HttpRemote<ExampleApi>(url, {
	time: async() => ({preAuth: undefined}),
})

const result = await client.fns.time.now()

if (typeof result === "number")
	console.log("✅ http call works", result)
else
	console.error("🟥 http call failed", result)

