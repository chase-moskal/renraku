
import {Api} from "./api.js"
import {Service} from "./service.js"
import {JsonRpc} from "./json-rpc.js"
import type {IncomingHttpHeaders} from "http"

export type Fn = (...args: any[]) => Promise<any>
export type Policy<PreAuth, Auth> = (preAuth: PreAuth) => Promise<Auth>
export type Fns<A extends Api> = Actualize<GetServices<A>>

export function fns<F extends Record<string, Fn>>(f: F) {
	return f
}

export type Services = Service<any, any, any> | {
	[key: string]: Services
}

export type RemoteServiceConfig<PreAuth> = {
	preAuth: PreAuth
	notification?: boolean
}

export type RemoteConfig<S extends Services> = (
	S extends Service<infer PreAuth, any, any>
		? () => Promise<RemoteServiceConfig<PreAuth>>
		: S extends {[key: string]: Services}
			? {[K in keyof S]: RemoteConfig<S[K]>}
			: never
)

export type Actualize<S extends Services> = {
	[P in keyof S]: S[P] extends Service<any, any, infer Fns>
		? Fns
		: S[P] extends Services
			? Actualize<S[P]>
			: never
}

export type EndpointDetails = {
	headers: HttpHeaders
	exposeErrors: boolean
}

export type Endpoint = (
	(incoming: JsonRpc.Request, details?: EndpointDetails) =>
		Promise<JsonRpc.Response | null>
)

export type GetServices<A extends Api<any>> = (
	A extends Api<infer S>
		? S
		: never
)

export type RpcParams<PreAuth = any, Args extends any[] = any[]> = {
	preAuth: PreAuth
	args: Args
}

export interface HttpHeaders extends IncomingHttpHeaders {}

