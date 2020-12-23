
import {DropFirst} from "../tool/drop-first.js"
import {Procedure} from "../primitive/procedure.js"
import {HttpRequest} from "../http/http-request.js"
import {HttpResponse} from "../http/http-response.js"

export type ToHttpProcedure<xAuth, xProcedure extends Procedure<any, any[], any>> = (
		request: HttpRequest,
		auth: xAuth,
		...args: DropFirst<Parameters<xProcedure>>
	) => Promise<HttpResponse>
