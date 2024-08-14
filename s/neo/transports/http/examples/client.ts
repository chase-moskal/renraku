
import {ExampleApi} from "./api.js"
import {httpRemote} from "../client.js"
import {provideAuth} from "../../../auth/provide.js"

const service = httpRemote<ExampleApi>("http://localhost:8000")

const unlocked = service.unlocked
// const locked = provideAuth("hello", service.locked)

const result1 = await unlocked.sum(1, 2)
// const result2 = await locked.now()
const result2 = await service.locked.now("hello")

if (result1 === 3 && typeof result2 === "number")
	console.log("✅ http works", result1, result2)
else
	console.error("🟥 http failed", result1, result2)

