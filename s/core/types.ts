
import {JsonRpc} from "../comms/json-rpc.js"

export type Fn = (...p: any[]) => Promise<any>
export type Service = Record<string, Fn>

export type Fns = {[key: string]: Fn | Fns}
export type Meta = {headers: GeneralHeaders, address: string}
export type Api<F extends Fns = any> = (meta: Meta) => F

export function fns<F extends Fns>(f: F) {
	return f
}

export function api<F extends Fns>(a: Api<F>) {
	return a
}

export type GeneralHeaders = Record<string, string>

export type OnInvocationFn = (
	request: JsonRpc.Request,
	response: JsonRpc.Response | null,
) => void

export type Endpoint = (
	(request: JsonRpc.Request, meta?: Meta) =>
		Promise<JsonRpc.Response | null>
)

