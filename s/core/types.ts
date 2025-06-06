
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

export type HttpMeta = {
	req: IncomingMessage
	headers: SimpleHeaders
	ip: string
}

export type Tap = {
	error: (error: any) => Promise<void>

	request: (options: {
		request: JsonRpc.Request
		label?: string
	}) => Promise<void>

	rpcError: (options: {
		error: any
		request: JsonRpc.Request
		label?: string
	}) => Promise<void>
}

export type EndpointSpecial = {
	transfer?: Transferable[]
}

export type Endpoint = (
	request: JsonRpc.Request,
	special?: EndpointSpecial,
) => Promise<JsonRpc.Response | null>

export {SimpleHeaders}

