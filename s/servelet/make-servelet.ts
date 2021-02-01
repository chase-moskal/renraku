
import {obtain} from "../tools/obtain.js"
import {ApiError} from "../api/api-error.js"
import {isApiError} from "../identities/is-api-error.js"

import {Api} from "../types/api/api.js"
import {Responder} from "../types/api/responder.js"
import {Policy} from "../types/primitives/policy.js"
import {Servelet} from "../types/primitives/servelet.js"
import {JsonRpcId} from "../types/jsonrpc/json-rpc-id.js"
import {ParseRequest} from "../types/api/parse-request.js"
import {ProcedureDescriptor} from "../types/api/procedure-descriptor.js"

export function makeServelet<xRequest, xResponse, xApi extends Api>({
		expose,
		responder,
		parseRequest,
	}: {
		expose: xApi
		responder: Responder<xResponse>
		parseRequest: ParseRequest<xRequest, any>
	}): Servelet<xRequest, xResponse> {

	return async function execute(request: xRequest): Promise<xResponse> {
		let errorRequestId: JsonRpcId
		try {
			const {requestId, specifier, meta, args} = await parseRequest(request)
			errorRequestId = requestId

			const {func, policy}:
				ProcedureDescriptor<any, any, any[], any, Policy<any, any, xRequest>> =
					obtain(specifier, expose)

			const auth = await policy.processAuth(meta, request)
			const result = await func(auth, ...args)
			return responder.resultResponse(requestId, result)
		}
		catch (error) {
			if (isApiError(error)) {
				return responder.errorResponse(errorRequestId, error)
			}
			else {
				throw new ApiError(500, "error")
			}
		}
	}
}
