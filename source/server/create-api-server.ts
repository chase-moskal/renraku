
import * as Koa from "koa"
import * as cors from "@koa/cors"
import {Server as HttpServer} from "http"
import * as koaBodyParser from "koa-bodyparser"

import {DisabledLogger} from "../toolbox/logging.js"
import {
	Server,
	TopicApi,
	ServerOptions,
} from "../interfaces.js"

import {apiCall} from "./api-call.js"
import {ServerError} from "./errors.js"

export function createApiServer<A extends TopicApi<A> = TopicApi>({
	topics,
	debug = false,
	koa = new Koa(),
	logger = new DisabledLogger()
}: ServerOptions<A>): Server {

	koa.use(cors())
	koa.use(koaBodyParser())

	koa.use(async context => {
		const {request, response} = context
		const {headers, rawBody: body} = request
		const {
			origin,
			["x-id"]: id,
			["x-signature"]: signature,
		} = headers

		try {
			response.body = JSON.stringify(
				await apiCall({
					id,
					body,
					debug,
					origin,
					logger,
					topics,
					signature,
				})
			)
		}
		catch (error) {
			logger.error(error)
			const code = error instanceof ServerError ? error.code : 500
			context.throw(code, debug ? error.message : "error")
		}
	})

	let server: HttpServer

	return {
		koa,
		start(port: number) {
			if (server) throw new Error("cannot start when already running")
			server = koa.listen(port)
			logger.log(`🌐 api server listening on port ${port}`)
		},
		async stop() {
			const result = await (
				server
					? new Promise<void>((resolve, reject) => {
						server.close(error => {
							if (error) reject(error)
							else resolve()
						})
					})
					: Promise.resolve()
			)
			logger.log("✔️ api server stopped")
			return result
		}
	}
}
