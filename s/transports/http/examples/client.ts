
import {httpRemote} from "../client.js"
import type {exampleApi} from "./api.js"
import {authorize} from "../../../auth/authorize.js"

const service = httpRemote<typeof exampleApi>("http://localhost:8000/")

const unlocked = service.unlocked
const locked = authorize(service.locked, async() => "hello")

const result1 = await unlocked.sum(1, 2)
const result2 = await locked.now()

if (result1 === 3 && typeof result2 === "number")
	console.log("✅ http works", result1, result2)
else
	console.error("🟥 http failed", result1, result2)

