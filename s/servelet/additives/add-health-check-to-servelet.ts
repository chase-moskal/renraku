
import {Servelet} from "../../types/primitives/servelet.js"
import {HttpRequest} from "../../types/http/http-request.js"
import {HttpResponse} from "../../types/http/http-response.js"

type HttpServelet = Servelet<HttpRequest, HttpResponse>

export function addHealthCheckToServelet(servelet: HttpServelet): HttpServelet {
	return async request => request.method === "get"
		? {
			headers: {"Content-Type": "text/plain"},
			...request.path === "/"
				? {status: 200, body: `ok ${Date.now()}`}
				: {status: 404, body: "not found"}
		}
		: servelet(request)
}
