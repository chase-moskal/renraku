
import {createServer} from "http"

import {allowCors} from "./node/allow-cors.js"
import {makeRequestListener} from "./make-request-listener.js"
import {addHealthCheckToServelet} from "../servelet/additives/add-health-check-to-servelet.js"

import {Servelet} from "../types/primitives/servelet.js"
import {HttpRequest} from "../types/http/http-request.js"
import {HttpResponse} from "../types/http/http-response.js"

export function makeNodeHttpServer(
		servelet: Servelet<HttpRequest, HttpResponse>
	) {

	return createServer(
		allowCors(
			makeRequestListener(
				addHealthCheckToServelet(
					servelet
				)
			)
		)
	)
}
