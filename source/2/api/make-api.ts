
import {ApiError} from "./api-error.js"
import {obtain} from "../tools/obtain.js"
import {Topic} from "../types/primitives/topic.js"
import {JsonRpcId} from "../types/jsonrpc/json-rpc-id.js"
import {Procedure} from "../types/primitives/procedure.js"
import {HttpResponse} from "../types/http/http-response.js"
import {RequestParser} from "../types/api/request-parser.js"
import {HttpResponder} from "../types/http/http-responder.js"
import {RequestAuthorizer} from "../types/api/request-authorizer.js"

export function makeApi<xRequest, xAuth, xMeta>({topic, parse, authorize, responder}: {
		topic: Topic<any>
		responder: HttpResponder
		parse: RequestParser<xRequest, xAuth>
		authorize: RequestAuthorizer<xRequest, xAuth, xMeta>
	}) {
	return async function executeProcedure(request: xRequest): Promise<HttpResponse> {
		let errorRequestId: JsonRpcId = undefined
		try {
			const {requestId, specifier, auth, args} = parse(request)
			errorRequestId = requestId
			const meta = await authorize(request, auth)
			const procedure: Procedure<any, any[], any> = obtain(specifier, topic)
			const result = await procedure(meta, ...args)
			return responder.resultResponse(requestId, result)
		}
		catch (error) {
			if (error instanceof ApiError) {
				return responder.errorResponse(errorRequestId, error)
			}
			else {
				throw new ApiError(500, "error")
			}
		}
	}
}
