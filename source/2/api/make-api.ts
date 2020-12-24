
import {ApiError} from "./api-error.js"
import {obtain} from "../tools/obtain.js"
import {Topic} from "../types/primitives/topic.js"
import {HttpRequest} from "../types/http/http-request.js"
import {Procedure} from "../types/primitives/procedure.js"
import {HttpResponse} from "../types/http/http-response.js"
import {HttpResponder} from "../types/http/http-responder.js"
import {respondJsonError} from "../responses/respond-json-error.js"
import {RequestParser} from "../types/api/request-parser.js"
import {RequestAuthorizer} from "../types/api/request-authorizer.js"

export function makeApi<xAuth, xMeta>({topic, parse, authorize, responder}: {
		topic: Topic<any>
		responder: HttpResponder
		parse: RequestParser<xAuth>
		authorize: RequestAuthorizer<xAuth, xMeta>
	}) {
	return async function executeProcedure(request: HttpRequest): Promise<HttpResponse> {
		try {
			const {requestId, specifier, auth, args} = parse(request)
			const meta = await authorize(request, auth)
			const procedure: Procedure<any, any[], any> = obtain(specifier, topic)
			const result = await procedure(meta, ...args)
			return responder.resultResponse(requestId, result)
		}
		catch (error) {
			if (error instanceof ApiError) {
				return respondJsonError(error.code, error.message)
			}
			else {
				throw new ApiError(500, "error")
			}
		}
	}
}
