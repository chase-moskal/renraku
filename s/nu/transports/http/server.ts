
import {Server} from "http"
import {allowCors} from "./utils/listener-transforms/allow-cors.js"
import {healthCheck} from "./utils/listener-transforms/health-check.js"
import {EndpointListenerOptions, makeEndpointListener} from "./utils/endpoint-listener.js"

export class HttpServer extends Server {
	constructor(options: EndpointListenerOptions) {
		super(
			allowCors(
				healthCheck(
					"/health",
					options.logger,
					makeEndpointListener(options),
				)
			)
		)
	}
}

