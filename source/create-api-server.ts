
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as koaBody from "koa-body"
import {Server as HttpServer} from "http"

import {Api, ServerExposures, Server} from "./interfaces.js"

export function createApiServer<A extends Api = Api>(
	exposures: ServerExposures<A>
): Server {

	const app = new Koa()
	app.use(cors())
	app.use(koaBody())

	app.use(async context => {
		const {request, response} = context
		const {origin} = request.headers

		const exposure = exposures.find(exposure => {
			const {allowed, forbidden} = exposure
			return allowed.test(origin) && !forbidden.test(origin)
		})

		if (!exposure) context.throw(403, "origin forbidden")
		const {exposed} = exposure

		const {topic, func, params} = request.body
		if (!topic) context.throw(400, "'topic' required")
		if (!func) context.throw(400, "'func' required")
		if (!params || !Array.isArray(params))
			context.throw(400, "'params' array required")

		if (!(topic in exposed))
			context.throw(400, `topic "${topic}" not available`)

		if (!(func in exposed[topic]))
			context.throw(400, `func "${func}" not available`)

		const callable = exposed[topic][func]

		try {
			const result = await callable(...params)
			response.body = JSON.stringify(result)
		}
		catch (error) {
			context.throw(400, `api error occurred: ${topic}.${func}`)
		}
	})

	let server: HttpServer

	return {
		start(port: number) {
			if (server) throw new Error("cannot start when already running")
			server = app.listen(port)
		},
		async stop() {
			if (!server) return
			return new Promise((resolve, reject) => {
				server.close(error => {
					if (error) reject(error)
					else resolve()
				})
			})
		}
	}
}
