
import * as Koa from "koa"
import * as cors from "@koa/cors"
import {Server as HttpServer} from "http"
import * as koaBodyParser from "koa-bodyparser"

import {DisabledLogger} from "./internals/logging.js"
import {
	Api,
	Server,
	ServerOptions,
} from "./interfaces.js"

import {apiCall} from "./internals/server/api-call.js"
import {RenrakuApiError} from "./internals/errors.js"

export function apiServer<A extends Api<A> = Api>({
	exposures,
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
					exposures,
					signature,
				})
			)
		}
		catch (error) {
			logger.error(error)
			const code = error.code ? error.code : 500
			context.throw(code, error.message)
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