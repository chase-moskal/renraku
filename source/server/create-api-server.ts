
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as koaBody from "koa-body"
import {Server as HttpServer} from "http"

import {Api, ServerExposures, Server} from "../interfaces.js"

import {ServerError} from "./server-error.js"
import {revealExposed} from "./reveal-exposed.js"
import {performFunctionCall} from "./perform-function-call.js"
import {validateRequestBody} from "./validate-request-body.js"

export function createApiServer<A extends Api = Api>(
	exposures: ServerExposures<A>
): Server {

	const debug = false

	const app = new Koa()
	app.use(cors())
	app.use(koaBody())

	app.use(async context => {
		const {request, response} = context
		const {origin} = request.headers
		const requestBody = request.body
		try {
			const exposed = revealExposed<A>({origin, exposures})
			const callable = validateRequestBody({exposed, requestBody})
			const {params} = requestBody
			const result = await performFunctionCall({callable, params, debug})
			response.body = JSON.stringify(result)
		}
		catch (error) {
			if (error instanceof ServerError)
				context.throw(error.code, error.message)
			else
				context.throw(500, debug ? error.message : "unknown error")
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
