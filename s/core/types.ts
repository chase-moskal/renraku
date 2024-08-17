
import {JsonRpc} from "../comms/json-rpc.js"
import type {IncomingHttpHeaders} from "http"

export type Fn = (...p: any[]) => Promise<any>
export type Service = Record<string, Fn>

export type Fns = {[key: string]: Fn | Fns}
export type Meta = {headers: HttpHeaders}
export type Api<F extends Fns = any> = (meta: Meta) => F

export function fns<F extends Fns>(f: F) {
	return f
}

export function api<A extends Api>(a: A) {
	return a
}

export type HttpHeaders = IncomingHttpHeaders

export type EndpointDetails = {
	headers: HttpHeaders
	exposeErrors: boolean
}

export type Endpoint = (
	(request: JsonRpc.Request, details?: EndpointDetails) =>
		Promise<JsonRpc.Response | null>
)

