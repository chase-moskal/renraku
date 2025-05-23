
import {Server} from "http"
import {defaults} from "../defaults.js"
import {logger} from "../../tools/logger.js"
import {endpoint} from "../../core/endpoint.js"
import {Endpoint, Fns, ServerMeta} from "../../core/types.js"
import {allowCors} from "./node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "./node-utils/listener-transforms/health-check.js"
import {EndpointListenerOptions, makeEndpointListener} from "./node-utils/endpoint-listener.js"

export class HttpServer extends Server {
	constructor(endpoint: (meta: ServerMeta) => Endpoint, options: EndpointListenerOptions = {}) {
		super(
			allowCors(
				healthCheck(
					"/health",
					makeEndpointListener(endpoint, options),
				)
			)
		)
		this.timeout = options.timeout ?? defaults.timeout
	}
}

export type HttpServerOptions = {
	port: number
	host?: string
	expose: (meta: ServerMeta) => Fns
}

export async function httpServer({port, host, expose}: HttpServerOptions) {
	const server = new HttpServer(meta => endpoint(expose(meta), logger.http(meta)))
	return new Promise<HttpServer>((resolve, reject) => {
		server.once("error", reject)
		if (host) server.listen(host, port, () => resolve(server))
		else server.listen(port, () => resolve(server))
	})
}

