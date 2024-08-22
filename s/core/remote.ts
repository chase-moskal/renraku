
import {RemoteError} from "./errors.js"
import {JsonRpc} from "../comms/json-rpc.js"
import {remoteProxy} from "./remote-proxy.js"
import {Endpoint, Fns, OnInvocationFn} from "./types.js"

export type RemoteOptions = {
	label?: string
	notify?: boolean
	onInvocation?: OnInvocationFn
}

let id = 0

export function remote<F extends Fns>(
		endpoint: Endpoint,
		options: RemoteOptions = {},
	) {

	return remoteProxy<F>(async(
			path,
			params,
			settings,
		) => {

		const notify = settings.notify ?? options.notify ?? false

		const base: JsonRpc.Notification<any[]> = {
			jsonrpc: "2.0" as const,
			method: path.join("."),
			params,
		}

		const request: JsonRpc.Request = (
			notify
				? base
				: {...base, id: id++}
		)

		const response = await endpoint(request)

		if (options.onInvocation)
			options.onInvocation(request, response)

		if (notify && !response)
			return null

		if (!response)
			throw new RemoteError(null, base.method, "response was null, but shouldn't be, because the request was not a notification")

		if ("error" in response)
			throw new RemoteError(response.id, base.method, (
				options.label
					? `${options.label}: ${response.error.message}`
					: response.error.message
			))

		return response.result
	})
}

