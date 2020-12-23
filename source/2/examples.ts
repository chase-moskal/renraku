
import {asTopic} from "./identity/as-topic.js"
import {toHttpTopic} from "./augment/to-http-topic.js"
import {jsonResponse} from "./response/json-response.js"

type MyAuth = {token: string}
type MyMeta = {access: {user: {}}}

const httpTopic = toHttpTopic<MyAuth, MyMeta>()({
	augmentor: method => async(request, auth, ...args) => {
		if (request.headers.origin !== "http://localhost:5000")
			throw new Error("forbidden origin")
		if (!auth.token)
			throw new Error("forbidden auth")
		const result = method({access: {user: {}}}, ...args)
		return jsonResponse(result)
	},
	topic: {
		math: {
			async sum(meta, x: number, y: number) {
				return x + y
			}
		}
	},
})

const myTopic = asTopic<MyMeta>()({
	math: {
		async sum({access}, x: number, y: number) {
			return x + y
		}
	}
})
