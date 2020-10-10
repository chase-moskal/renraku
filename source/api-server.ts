
import {DisabledLogger} from "./logging.js"
import {serverizeApi, serverizeTopic} from "./curries.js"
import {Api, ApiServerOptions, ServerApi, ServerContext, Topic} from "./types.js"

export async function apiServer<A extends ServerApi>({
		expose,
		debug = false,
		logger = new DisabledLogger,
	}: ApiServerOptions<A>) {
	return {
		start(port: number) {}
	}
}

const noopAugmentation = async(request: ServerContext) =>
	async(result: any) => ({result})

export function simpleServerTopic<T extends Topic>(topic: T) {
	return serverizeTopic(noopAugmentation, topic)
}

export function simpleServerApi<A extends Api>(api: A) {
	return serverizeApi(noopAugmentation, api)
}

// // TODO cjs
// import mod from "module"
// const require = mod.createRequire(import.meta.url)
// import * as _Koa from "koa"
// import * as _cors from "@koa/cors"
// import * as _koaBodyParser from "koa-bodyparser"
// const Koa = require("koa") as typeof _Koa
// const cors = require("@koa/cors") as typeof _cors
// const koaBodyParser = require("koa-bodyparser") as typeof _koaBodyParser

// import {Server as HttpServer} from "http"

// import {DisabledLogger} from "./logging.js"
// import {
// 	Api,
// 	Server,
// 	ServerOptions,
// } from "./types.js"

// import {apiCall} from "./internals/node/api-call.js"

// /*

// TODO
// new concept

// 	const server = await apiServer({
// 		debug: true,
// 		logger: console,
// 		expose: {
// 			authTopic: contextualizeTopic(context => enforceCors(context.origin), {
// 				async authorize(meta, options) {},
// 			}),
// 		}
// 	})

// */

// export async function apiServer<A extends Api>({
// 	exposures,
// 	debug = false,
// 	koa = new Koa(),
// 	logger = new DisabledLogger()
// }: ServerOptions<A>): Promise<Server> {

// 	koa.use(cors())
// 	koa.use(koaBodyParser())

// 	koa.use(async context => {
// 		const {request, response} = context
// 		const {headers, rawBody: body} = request
// 		const {
// 			origin,
// 			["x-id"]: id,
// 			["x-signature"]: signature,
// 		} = headers

// 		try {
// 			response.body = JSON.stringify(
// 				await apiCall({
// 					id,
// 					body,
// 					debug,
// 					origin,
// 					logger,
// 					exposures,
// 					signature,
// 				})
// 			)
// 		}
// 		catch (error) {
// 			logger.error(error)
// 			const code = error.code ? error.code : 500
// 			context.throw(code, error.message)
// 		}
// 	})

// 	let server: HttpServer

// 	return {
// 		koa,
// 		start(port: number) {
// 			if (server) throw new Error("cannot start when already running")
// 			server = koa.listen(port)
// 			logger.info(`🌐 api server listening on port ${port}`)
// 		},
// 		async stop() {
// 			const result = await (
// 				server
// 					? new Promise<void>((resolve, reject) => {
// 						server.close(error => {
// 							if (error) reject(error)
// 							else resolve()
// 						})
// 					})
// 					: Promise.resolve()
// 			)
// 			logger.info("✔️ api server stopped")
// 			return result
// 		}
// 	}
// }
