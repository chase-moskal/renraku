
import {Endpoint, Fns} from "./types.js"
import {JsonRpc} from "../comms/json-rpc.js"
import {remoteProxy} from "./remote-proxy.js"

export type RemoteOptions = {
	notification?: boolean
}

let id = 0

export function remote<F extends Fns>(
		endpoint: Endpoint,
		options: RemoteOptions = {notification: false},
	) {

	return remoteProxy<F>(async(
			path,
			params,
			settings,
		) => {

		const notification = settings.notification ?? options.notification ?? false

		// add leading dot
		const method = "." + path.join(".")

		const base: JsonRpc.Notification<any[]> = {
			jsonrpc: "2.0" as const,
			method,
			params,
		}

		const response = await endpoint(
			notification
				? base
				: {...base, id: id++}
		)

		if (notification && !response)
			return response

		if (!response)
			throw new Error("response was null, but shouldn't be, because the request was not a notification")

		if ("error" in response)
			throw new Error(response.error.message)

		return response.result
	})
}

