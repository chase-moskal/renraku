
import {RenrakuError} from "../../error.js"
import {JsonRpcErrorResponse, JsonRpcRequestWithMeta, JsonRpcResponse, JsonRpcSuccessResponse, Servelet} from "../../types.js"

export function negotiator() {

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

		async acceptIncoming({servelet, exposeErrors, incoming, respond}: {
				servelet: Servelet
				exposeErrors: boolean
				incoming: JsonRpcRequestWithMeta | JsonRpcResponse
				respond: (response: JsonRpcResponse) => void
			}) {
			if ((<JsonRpcRequestWithMeta>incoming).method) {
				const {id, meta, method, params} = <JsonRpcRequestWithMeta>incoming
				try {
					const result = await servelet({meta, method, params})
					respond(<JsonRpcSuccessResponse>{
						jsonrpc: "2.0",
						id,
						result,
					})
				}
				catch (error) {
					if (!(error instanceof RenrakuError)) {
						error = new RenrakuError(
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
				}
			}
			else {
				const response = <JsonRpcResponse>incoming
				if ((<JsonRpcErrorResponse>response).error) {
					const {id, error: {code, message}} = <JsonRpcErrorResponse>response
					rejectPendingResponse(id, new RenrakuError(code, message))
				}
				else {
					const {id, result} = <JsonRpcSuccessResponse>response
					resolvePendingResponse(id, result)
				}
			}
		},
	}
}
