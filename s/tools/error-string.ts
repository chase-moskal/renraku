
import {JsonRpc} from "../core/json-rpc.js"

export function errorString(error?: any, prefix = "") {
	const message = (error && error instanceof Error)
		? error.stack ?? `${error.name}: ${error.message}`
		: null
	return ["🚨", prefix, message].filter(e => !!e).join(" ")
}

export function rpcErrorString({message, data}: JsonRpc.Error) {
	return `🚨 ${message} ${data ?? ""}`
}

