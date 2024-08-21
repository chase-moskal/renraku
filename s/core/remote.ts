
import {Endpoint, Fns} from "./types.js"
import {JsonRpc} from "../comms/json-rpc.js"
import {remoteProxy} from "./remote-proxy.js"

export type RemoteOptions = {
	notify?: boolean
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

		const response = await endpoint(
			notify
				? base
				: {...base, id: id++}
		)

		if (notify && !response)
			return null

		if (!response)
			throw new Error("response was null, but shouldn't be, because the request was not a notification")

		if ("error" in response)
			throw new Error(response.error.message)

		return response.result
	})
}

