
import {Api} from "./api.js"
import {Service} from "./service.js"
import {JsonRpc} from "./json-rpc.js"
import type {IncomingHttpHeaders} from "http"

export type Fn = (...args: any[]) => Promise<any>

export type NestedServices = Service<any, any, any> | {
	[key: string]: NestedServices
}

export type RemoteServiceConfig<PreAuth> = {
	preAuth: PreAuth
	notification?: boolean
}

export type RemoteConfig<Services extends NestedServices> = (
	Services extends Service<infer PreAuth, any, any>
		? () => Promise<RemoteServiceConfig<PreAuth>>
		: Services extends {[key: string]: NestedServices}
			? {[K in keyof Services]: RemoteConfig<Services[K]>}
			: never
)

export type Actualize<Services extends NestedServices> = {
	[P in keyof Services]: Services[P] extends Service<any, any, infer Fns>
		? Fns
		: Services[P] extends NestedServices
			? Actualize<Services[P]>
			: never
}

export type Endpoint = (incoming: JsonRpc.Request) => Promise<JsonRpc.Response>

export type GetServices<A extends Api<any>> = (
	A extends Api<infer S>
		? S
		: never
)

export interface HttpHeaders extends IncomingHttpHeaders {}

export interface Logger {
	log(...data: any[]): void
	warn(...data: any[]): void
	error(...data: any[]): void
}

