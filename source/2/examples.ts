
import { toHttpTopic } from "./augment/to-http-topic.js"
import {asTopic} from "./identity/as-topic.js"
import { jsonResponse } from "./scratch.js"

const myTopic = asTopic({
	myTopic: {
		async sum(meta, x: number, y: number) {
			return x + y
		}
	}
})

type MyAuth = {token: string}
type MyMeta = {access: {}}

const lol = toHttpTopic<MyAuth, MyMeta>()(
	(method) => async(request, auth, ...args) => {
		if (request.headers.origin !== "http://localhost:5000")
			throw new Error("forbidden origin")
		if (!auth.token)
			throw new Error("forbidden auth")
		const result = method({access: {}}, ...args)
		return jsonResponse(result)
	},
	{
		myTopic: {
			async sum(meta, x: number, y: number) {
				return x + y
			}
		}
	},
)
