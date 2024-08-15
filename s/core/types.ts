
import {JsonRpc} from "../comms/json-rpc.js"
import type {IncomingHttpHeaders} from "http"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = Record<string, Fn>

export type NestedFns = Fn | {[key: string]: Api}
export type Meta = {headers: HttpHeaders}
export type Api<N extends NestedFns = any> = (meta: Meta) => N

export type GetNestedFns<A extends Api> = ReturnType<A>

export function api<A extends Api<any>>(a: A) {
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

