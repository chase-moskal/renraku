
import {JsonRpc} from "../../../comms/json-rpc.js"
import {TimeoutError} from "../../../core/errors.js"
import {deferPromise, DeferredPromise} from "../../../tools/defer-promise.js"

type Pend = {
	deferred: DeferredPromise<JsonRpc.Response>
	timeoutId: any
}

export class ResponseWaiter {
	pending = new Map<JsonRpc.Id, Pend>()

	constructor(public timeout: number) {}

	wait(id: JsonRpc.Id) {
		const deferred = deferPromise<JsonRpc.Response>()
		const timeoutFn = () => {
			deferred.reject(new TimeoutError(`request ${id} timed out`))
			this.pending.delete(id)
		}
		const timeoutId = setTimeout(timeoutFn, this.timeout)
		this.pending.set(id, {deferred, timeoutId})
		return deferred.promise
	}

	deliverResponse(response: JsonRpc.Response) {
		const pend = this.pending.get(response.id)
		if (pend) {
			clearTimeout(pend.timeoutId)
			if ("error" in response)
				pend.deferred.reject(new Error(response.error.message))
			else
				pend.deferred.resolve(response)
		}
	}
}
