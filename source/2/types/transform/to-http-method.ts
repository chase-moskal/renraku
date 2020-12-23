
import {Method} from "../primitive/method.js"
import {DropFirst} from "../tool/drop-first.js"
import {HttpRequest} from "../http/http-request.js"
import {HttpResponse} from "../http/http-response.js"

export type ToHttpMethod<xAuth, xMethod extends Method<any, any[], any>> = (
		request: HttpRequest,
		auth: xAuth,
		...args: DropFirst<Parameters<xMethod>>
	) => Promise<HttpResponse>
