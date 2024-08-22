
import {JsonRpc} from "../comms/json-rpc.js"

export function errstring(error: any) {
	if (typeof error === "string")
		return error

	if (error instanceof Error)
		return error.stack ?? `${error.name}: ${error.message}`

	return `${typeof error} error`
}

export function remoteErrstring(error: any, id: JsonRpc.Id, method: string) {
	return id === null
		? `${method}(): ${errstring(error)}`
		: `#${id} ${method}(): ${errstring(error)}`
}

