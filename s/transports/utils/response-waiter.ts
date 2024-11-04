
import {JsonRpc} from "../../comms/json-rpc.js"
import {deadline} from "../../tools/deadline.js"
import {RemoteError} from "../../core/errors.js"
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
		return await deadline(this.timeout, `request #${id} ${method}()`, () => deferred.promise)
	}

	deliverResponse(response: JsonRpc.Response) {
		const pend = this.pending.get(response.id)
		if (pend) {
			if ("error" in response)
				pend.deferred.reject(new RemoteError(response.error.message))
			else
				pend.deferred.resolve(response)
		}
	}
}

