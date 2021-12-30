
import {ApiError} from "../../error.js"
import {stopwatch} from "../../tools/stopwatch.js"
import {HttpHeaders, JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, Logger, Servelet} from "../../types.js"

export function negotiator({logger, exposeErrors}: {
		logger: Logger
		exposeErrors: boolean
	}) {

	let requestCount = 0

	const pendingResponses = new Map<number, {
		resolve: (result: any) => void
		reject: (reason?: any) => void
	}>()

	function resolvePendingResponse(id: number, result: any) {
		const waiter = pendingResponses.get(id)
		if (waiter)
			waiter.resolve(result)
		pendingResponses.delete(id)
	}

	function rejectPendingResponse(id: number, reason: any) {
		const waiter = pendingResponses.get(id)
		if (waiter)
			waiter.reject(reason)
		pendingResponses.delete(id)
	}

	return {

		startWaitingForResponse() {
			const id = requestCount++
			return {
				id,
				response: new Promise<any>((resolve, reject) => {
					pendingResponses.set(id, {resolve, reject})
				}),
			}
		},

		async acceptIncoming({servelet, headers, incoming, respond}: {
				servelet: Servelet
				headers: HttpHeaders
				incoming: JsonRpcRequestWithMeta | JsonRpcResponse
				respond: (response: JsonRpcResponse) => void
			}) {
			if ((<JsonRpcRequestWithMeta>incoming).method) {
				const {id, meta, method, params} = <JsonRpcRequestWithMeta>incoming
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
			else {
				const response = <JsonRpcResponse>incoming
				if ((<JsonRpcErrorResponse>response).error) {
					const {id, error: {code, message}} = <JsonRpcErrorResponse>response
					if (id === -1)
						throw new ApiError(code, message)
					else
						rejectPendingResponse(id, new ApiError(code, message))
				}
				else {
					const {id, result} = <JsonRpcSuccessResponse>response
					resolvePendingResponse(id, result)
				}
			}
		},
	}
}
