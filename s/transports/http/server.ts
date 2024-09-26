
import {Server} from "http"
import {Endpoint, ServerMeta} from "../../core/types.js"
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
	}
}

