
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as koaBody from "koa-body"
import {Server as HttpServer} from "http"

import {Api, ServerExposures, Server} from "../interfaces.js"

import {apiCall} from "./api-call.js"
import {ServerError} from "./server-error.js"

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
			const result = apiCall({origin, debug, requestBody, exposures})
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
