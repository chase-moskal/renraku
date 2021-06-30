
import {obtain} from "../tools/obtain.js"
import {ApiError} from "../api/api-error.js"
import {isApiError} from "../identities/is-api-error.js"
import {noServeletLogger} from "./logger/no-servelet-logger.js"

import {Api} from "../types/api/api.js"
import {stopwatch} from "../tools/stopwatch.js"
import {Responder} from "../types/api/responder.js"
import {Policy} from "../types/primitives/policy.js"
import {Servelet} from "../types/primitives/servelet.js"
import {JsonRpcId} from "../types/jsonrpc/json-rpc-id.js"
import {ParseRequest} from "../types/api/parse-request.js"
import {ServeletLogger} from "../types/servelet/servelet-logger.js"
import {serveletLoggerPlain} from "./logger/servelet-logger-plain.js"
import {ProcedureDescriptor} from "../types/api/procedure-descriptor.js"

export function makeServelet<xRequest, xResponse, xApi extends Api>({
		expose,
		responder,
		serveletLogger = serveletLoggerPlain(console),
		parseRequest,
	}: {
		expose: xApi
		serveletLogger?: ServeletLogger
		responder: Responder<xResponse>
		parseRequest: ParseRequest<xRequest, any>
	}): Servelet<xRequest, xResponse> {

	return async function execute(request: xRequest): Promise<xResponse> {
		let errorRequestId: JsonRpcId
		try {
			const totalClock = stopwatch()
			const {requestId, specifier, meta, args} = await parseRequest(request)
			errorRequestId = requestId

			const {func, policy}:
				ProcedureDescriptor<any, any, any[], any, Policy<any, any, xRequest>> =
					obtain(specifier, expose)

			const times = {
				auth: -1,
				procedure: -1,
				total: -1,
			}

			const authClock = stopwatch()
			const auth = await policy.processAuth(meta, request)
			times.auth = authClock()

			const procedureClock = stopwatch()
			const result = await func(auth, ...args)
			times.procedure = procedureClock()

			const response = responder.resultResponse(requestId, result)
			times.total = totalClock()

			serveletLogger.logRequest({specifier, meta, args, times, result})
			return response
		}
		catch (error) {
			if (isApiError(error)) {
				serveletLogger.logApiError(error)
				return responder.errorResponse(errorRequestId, error)
			}
			else {
				serveletLogger.logUnexpectedError(error)
				return responder.errorResponse(errorRequestId, new ApiError(500, "error"))
			}
		}
	}
}
