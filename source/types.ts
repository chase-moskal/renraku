
export interface Logger {
	log: typeof console.log
	warn: typeof console.warn
	info: typeof console.info
	debug: typeof console.debug
	error: typeof console.error
}

//
// API TYPE SIGNATURES
//

export interface Api { [key: string]: Topic }
export interface Topic { [key: string]: Method }
export type Method = (...args: any[]) => Promise<any>

export const asApi = <A extends Api>(api: A) => api
export const asTopic = <T extends Topic>(topic: T) => topic
export const asMethod = <M extends Method>(method: M) => method

//
// CURRIES
//

export type Await<T> = T extends Promise<infer U> ? U : T
export type AwaitProps<T> = {[P in keyof T]: Await<T[P]>}

export type Shift<T extends any[]> = T["length"] extends 0
	? undefined
	: (((...b: T) => void) extends (a: any, ...b: infer I) => void ? I : [])

// meta

export type MetaMethod<Meta> = (meta: Meta, ...args: any[]) => Promise<any>
export type PayloadMethod<Payload> = (meta: Payload, ...args: any[]) => Promise<any>

export type AddMeta<M extends MetaMethod<any>> =
	(...args: Shift<Parameters<M>>) => ReturnType<M>

export type AddMetaTopic<T extends Topic> = {
	[P in keyof T]: AddMeta<T[P]>
}

export type AddMetaApi<A extends Api> = {
	[P in keyof A]: AddMetaTopic<A[P]>
}

export type ProcessPayload<Meta, M extends Method> =
	(meta: Meta, ...args: Shift<Parameters<M>>) => ReturnType<M>

export type ProcessPayloadTopic<Meta, T extends Topic> = {
	[P in keyof T]: ProcessPayload<Meta, T[P]>
}

export type ProcessPayloadApi<Meta, A extends Api> = {
	[P in keyof A]: ProcessPayloadTopic<Meta, A[P]>
}

// augmentation

export type Declientize<M extends ClientMethod> =
	(...args: Shift<Parameters<M>>) => Promise<Await<ReturnType<M>>["result"]>

export type DeclientizeTopic<T extends ClientTopic> = {
	[P in keyof T]: Declientize<T[P]>
}

export type DeclientizeApi<A extends ClientApi> = {
	[P in keyof A]: DeclientizeTopic<A[P]>
}

export type Serverize<M extends (...args: any[]) => Promise<any>> = (
	context: ServerContext,
	...args: Parameters<M>
) => Promise<ServerResponse<Await<ReturnType<M>>>>

export type ServerizeTopic<T extends ServerTopic> = {
	[P in keyof T]: Serverize<T[P]>
}

export type ServerizeApi<A extends ServerApi> = {
	[P in keyof A]: ServerizeTopic<A[P]>
}

export type Clientize<A extends Api> = {
	[P in keyof A]: {
		[P2 in keyof A[P]]: (
			context: ClientContext,
			...args: Parameters<A[P][P2]>
		) => Promise<ClientResponse<Await<ReturnType<A[P][P2]>>>>
	}
}

export type Augmentation<Ret = any> = (context: ServerContext) => Promise<
	(result: Ret) => Promise<ServerResponse<Ret>>
>

//
// SHAPES
//

export type Shape<T extends Topic> = {
	[P in keyof T]: T[P] extends Method
		? "method"
		: never
}

export type ApiShape<A extends Api> = {
	[P in keyof A]: Shape<A[P]>
}

//
// SERVER
//

// export interface Server {
// 	koa: Koa
// 	start(port: number): void
// 	stop(): Promise<void>
// }

export interface CorsPermissions {
	allowed: RegExp
	forbidden: RegExp
}

export interface WhitelistPermissions {
	[key: string]: string
}

// export interface BasicExposure<E extends Topic> {
// 	exposed: E
// }

// export interface CorsExposure<E extends Topic> extends BasicExposure<E> {
// 	cors: CorsPermissions
// }

// export interface WhitelistExposure<E extends Topic> extends BasicExposure<E> {
// 	whitelist: WhitelistPermissions
// }

// export type Exposure<E extends Topic> = CorsExposure<E> | WhitelistExposure<E>
// export type UnknownExposure<E extends Topic = any> =
// 	BasicExposure<E> & Partial<CorsExposure<E>> & Partial<WhitelistExposure<E>>

// export type ApiToExposures<A extends Api> = {
// 	[P in keyof A]: Exposure<A[P]>
// }

// export interface ServerOptions<A extends Api> {
// 	exposures: ApiToExposures<A>
// 	koa?: Koa
// 	debug?: boolean
// 	logger?: Logger
// }

//
// CLIENT
//

export type ApiClient<A extends Api> = (options: ClientOptions<A>) => Promise<A>

export interface ClientOptions<A extends Api> {
	url: string
	shape: ApiShape<A>
	credentials?: Credentials
}

export interface Credentials {
	id: string
	privateKey: string
}

//
// NEW REGIME
//

export interface Headers {
	[key: string]: string
}

export interface ServerContext {
	headers: Headers
}

export interface ClientContext {
	headers?: Headers
}

export type ServerResponse<R = any> = {
	header?: Headers
	result: R
}

export type ClientResponse<R = any> = {
	header: Headers
	result: R
}

//

export type ServerMethod = (
	context: ServerContext,
	...args: any[]
) => Promise<ServerResponse>

export type ClientMethod = (
	context: ClientContext,
	...args: any[]
) => Promise<ClientResponse>

export interface ServerTopic extends Topic {[key: string]: ServerMethod}
export interface ClientTopic extends Topic {[key: string]: ClientMethod}

export interface ServerApi extends Api {[key: string]: ServerTopic}
export interface ClientApi extends Api {[key: string]: ClientTopic}

//

export interface ApiServerOptions<A extends ServerApi> {
	expose: A
	debug?: boolean
	logger?: Logger
}

export interface ApiClientOptions<A extends Api> {
	url: string
	shape: ApiShape<A>
}
