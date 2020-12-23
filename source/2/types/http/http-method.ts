
import {HttpRequest} from "./http-request.js"
import {HttpResponse} from "./http-response.js"

export type HttpMethod<xAuth extends any> = (
		request: HttpRequest,
		auth: xAuth,
		...args: any[]
	) => Promise<HttpResponse>
