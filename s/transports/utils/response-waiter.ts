
import {JsonRpc} from "../../comms/json-rpc.js"
import {RemoteError, RemoteTimeoutError} from "../../core/errors.js"
import {deferPromise, DeferredPromise} from "../../tools/defer-promise.js"

type Pend = {
	method: string
	deferred: DeferredPromise<JsonRpc.Response>
	clear: () => void
}

export class ResponseWaiter {
	pending = new Map<JsonRpc.Id, Pend>()

	constructor(public timeout: number) {}

	wait(id: JsonRpc.Id, method: string) {
		const deferred = deferPromise<JsonRpc.Response>()
		const timeoutFn = () => {
			deferred.reject(new RemoteTimeoutError(id, method, `timed out in ${(this.timeout / 1000).toFixed(1)} seconds`))
			clear()
		}
		const timeoutId = setTimeout(timeoutFn, this.timeout)
		const clear = () => clearTimeout(timeoutId)
		this.pending.set(id, {method, deferred, clear})
		return deferred.promise
	}

	deliverResponse(response: JsonRpc.Response) {
		const pend = this.pending.get(response.id)
		if (pend) {
			pend.clear()
			if ("error" in response)
				pend.deferred.reject(new RemoteError(response.id, pend.method, response.error.message))
			else
				pend.deferred.resolve(response)
		}
	}
}

