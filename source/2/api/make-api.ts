
import {ApiError} from "./api-error.js"
import {obtain} from "../tools/obtain.js"
import {Api} from "../types/primitives/api.js"
import {Topic} from "../types/primitives/topic.js"
import {Responder} from "../types/api/responder.js"
import {JsonRpcId} from "../types/jsonrpc/json-rpc-id.js"
import {Procedure} from "../types/primitives/procedure.js"
import {RequestParser} from "../types/api/request-parser.js"
import {RequestAuthorizer} from "../types/api/request-authorizer.js"

export function makeApi<xRequest, xResponse, xAuth, xMeta>({expose, responder, parse, authorize}: {
		expose: Topic<any>
		responder: Responder<xResponse>
		parse: RequestParser<xRequest, xAuth>
		authorize: RequestAuthorizer<xRequest, xAuth, xMeta>
	}): Api<xRequest, xResponse> {
	return async function api(request: xRequest): Promise<xResponse> {
		let errorRequestId: JsonRpcId = undefined
		try {
			const {requestId, specifier, auth, args} = parse(request)
			errorRequestId = requestId
			const meta = await authorize(request, auth)
			const procedure: Procedure<any, any[], any> = obtain(specifier, expose)
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
