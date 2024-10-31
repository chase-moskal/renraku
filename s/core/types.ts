
import type {IncomingMessage} from "http"
import {JsonRpc} from "../comms/json-rpc.js"
import {SimpleHeaders} from "../tools/simple-headers.js"

export type Fn = (...p: any[]) => Promise<JsonRpc.Serializable>
export type Fns = {[key: string]: Fn | Fns}
export type Service = Record<string, Fn>

export function fns<F extends Fns>(f: F) {
	return f
}

export type ServerMeta = {
	req: IncomingMessage
	headers: SimpleHeaders
	ip: string
}

export type OnError = (error: any) => void

export type OnCall = (options: {
	request: JsonRpc.Request
	remote: boolean
}) => void

export type OnCallError = (options: {
	error: any
	request: JsonRpc.Request
	remote: boolean
}) => void

export type Endpoint = (
	(request: JsonRpc.Request) =>
		Promise<JsonRpc.Response | null>
)

export {SimpleHeaders}

