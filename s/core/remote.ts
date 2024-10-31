
import {RemoteError} from "./errors.js"
import {JsonRpc} from "../comms/json-rpc.js"
import {remoteProxy} from "./remote-proxy.js"
import {Endpoint, Fns, OnCall} from "./types.js"
import {loggers} from "../tools/logging/loggers.js"

export type RemoteOptions = {
	label?: string
	notify?: boolean
	onCall?: OnCall
}

export function remote<F extends Fns>(
		endpoint: Endpoint,
		options: RemoteOptions = {},
	) {

	let id = 1
	const {onCall = loggers.onCall} = options

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

		onCall({request, remote: true})

		const response = await endpoint(request)

		if (notify && !response)
			return null

		if (!response)
			throw new RemoteError("response was null, but shouldn't be, because the request was not a notification")

		if ("error" in response)
			throw new RemoteError(
				options.label
					? `${options.label}: ${response.error.message}`
					: response.error.message
			)

		return response.result
	})
}

