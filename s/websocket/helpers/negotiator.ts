
import {ApiError} from "../../error.js"
import {isRequest} from "./is-request.js"
import {stopwatch} from "../../tools/stopwatch.js"
import {responseWaiter} from "./response-waiter.js"
import {HttpHeaders, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, Logger, Servelet} from "../../types.js"

export function negotiator({logger, timeout, exposeErrors}: {
		logger: Logger
		timeout: number
		exposeErrors: boolean
	}) {

	const {
		startWaitingForResponse,
		resolvePendingResponse,
		rejectPendingResponse,
	} = responseWaiter({timeout})

	async function acceptIncomingRequest({servelet, headers, request, respond}: {
			servelet: Servelet
			headers: HttpHeaders
			request: JsonRpcRequestWithMeta
			respond: (response: JsonRpcResponse) => void
		}) {
		const {id, meta, method, params} = <JsonRpcRequestWithMeta>request
		try {
			const timer = stopwatch()
			const result = await servelet({
				meta,
				method,
				params,
				headers,
			})
			const duration = timer()
			respond(<JsonRpcSuccessResponse>{
				jsonrpc: "2.0",
				id,
				result,
			})
			logger.log(`🔻 ${method}() - ${duration}ms`)
		}
		catch (error) {
			if (!(error instanceof ApiError)) {
				error = new ApiError(
					500,
					exposeErrors
						? error.message
						: "hidden error",
				)
			}
			respond(<JsonRpcErrorResponse>{
				jsonrpc: "2.0",
				id,
				error: {
					code: error.code,
					message: error.message,
				},
			})
			logger.error(`🚨 ${error.code ?? 500}`, error.stack)
		}
	}

	async function acceptIncomingResponse({response}: {
			response: JsonRpcResponse
		}) {
		if ((<JsonRpcErrorResponse>response).error) {
			const {id, error: {code, message}} = <JsonRpcErrorResponse>response
			if (id === -1)
				logger.error(`🚨 ${code ?? 500} ${message}`)
			else
				rejectPendingResponse(id, new ApiError(code, message))
		}
		else {
			const {id, result} = <JsonRpcSuccessResponse>response
			resolvePendingResponse(id, result)
		}
	}

	return {
		startWaitingForResponse,

		async acceptIncoming({servelet, headers, incoming, respond}: {
				servelet: Servelet
				headers: HttpHeaders
				incoming: JsonRpcRequestWithMeta | JsonRpcResponse
				respond: (response: JsonRpcResponse) => void
			}) {
			if (isRequest(incoming))
				acceptIncomingRequest({
					request: <JsonRpcRequestWithMeta>incoming,
					headers,
					respond,
					servelet,
				})
			else
				acceptIncomingResponse({response: <JsonRpcResponse>incoming})
		},
	}
}
