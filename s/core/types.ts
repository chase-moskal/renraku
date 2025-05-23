
import type {IncomingMessage} from "http"
import {JsonRpc} from "../comms/json-rpc.js"
import {SimpleHeaders} from "../tools/simple-headers.js"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export type Service = Record<string, Fn>
export type AsFns<F extends Fns> = F

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
	label?: string
}) => void

export type OnCallError = (options: {
	error: any
	request: JsonRpc.Request
	label?: string
}) => void

export type Endpoint = (
	(request: JsonRpc.Request, transfer?: Transferable[]) =>
		Promise<JsonRpc.Response | null>
)

export {SimpleHeaders}

