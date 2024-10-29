
import {JsonRpc} from "../../comms/json-rpc.js"
import {deadline, DeadlineError} from "../../tools/deadline.js"
import {RemoteError, RemoteTimeoutError} from "../../core/errors.js"
import {deferPromise, DeferredPromise} from "../../tools/defer-promise.js"

type Pend = {
	method: string
	deferred: DeferredPromise<JsonRpc.Response>
}

export class ResponseWaiter {
	pending = new Map<JsonRpc.Id, Pend>()

	constructor(public timeout: number) {}

	async wait(id: JsonRpc.Id, method: string) {
		const deferred = deferPromise<JsonRpc.Response>()
		this.pending.set(id, {method, deferred})
		return await deadline(this.timeout, () => deferred.promise).catch(error => {
			throw (error instanceof Error)
				? (error instanceof DeadlineError)
					? new RemoteTimeoutError(id, method, error.message)
					: new RemoteError(id, method, error.message)
				: new RemoteError(id, method, "unknown error")
		})
	}

	deliverResponse(response: JsonRpc.Response) {
		const pend = this.pending.get(response.id)
		if (pend) {
			if ("error" in response)
				pend.deferred.reject(new RemoteError(response.id, pend.method, response.error.message))
			else
				pend.deferred.resolve(response)
		}
	}
}

