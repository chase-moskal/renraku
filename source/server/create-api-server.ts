
import * as Koa from "koa"
import * as cors from "@koa/cors"
import * as koaBody from "koa-body"
import {Server as HttpServer} from "http"

import {DisabledLogger} from "../toolbox/logging.js"
import {Api, Server, ServerOptions} from "../interfaces.js"

import {apiCall} from "./api-call.js"
import {ServerError} from "./server-error.js"

export function createApiServer<A extends Api = Api>({
	exposures,
	debug = false,
	logger = new DisabledLogger()
}: ServerOptions<A>): Server {

	const koa = new Koa()
	koa.use(cors())
	koa.use(koaBody())

	koa.use(async context => {
		const {request, response} = context
		const {origin} = request.headers
		const requestBody = request.body

		logger.info(``)
		logger.info(`🔔`, origin)
		logger.debug(` request body:`, requestBody)

		try {
			const result = await apiCall({origin, debug, requestBody, exposures})
			response.body = JSON.stringify(result)
			logger.debug(` result:`, result)
		}
		catch (error) {
			logger.error(error)
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
			server = koa.listen(port)
			logger.log(`🌐  api server listening on port ${port}`)
		},

		async stop() {
			const result = await server
				? new Promise<void>((resolve, reject) => {
					server.close(error => {
						if (error) reject(error)
						else resolve()
					})
				})
				: Promise.resolve()
			logger.log("✔️ api server stopped")
			return result
		}
	}
}
