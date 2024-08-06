
import {JsonRpc} from "../../../core/json-rpc.js"
import {TimeoutError} from "../../../core/errors.js"
import {deferPromise, DeferredPromise} from "../../../../tools/defer-promise.js"

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
			deferred.reject(new TimeoutError())
			this.pending.delete(id)
		}
		const timeoutId = setTimeout(timeoutFn, this.timeout)
		this.pending.set(id, {deferred, timeoutId})
		return deferred.promise
	}

	resolveResponse(id: JsonRpc.Id, response: JsonRpc.Response) {
		const pend = this.pending.get(id)
		if (pend) {
			clearTimeout(pend.timeoutId)
			pend.deferred.resolve(response)
			this.pending.delete(id)
		}
	}

	rejectResponse(id: number, reason: any) {
		const pend = this.pending.get(id)
		if (pend) {
			clearTimeout(pend.timeoutId)
			pend.deferred.reject(reason)
			this.pending.delete(id)
		}
	}
}

