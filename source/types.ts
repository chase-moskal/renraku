
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

export type CurriedMethodMeta<M extends Method> =
	(...args: Shift<Parameters<M>>) => ReturnType<M>

export type CurriedTopicMeta<T extends Topic> = {
	[P in keyof T]: CurriedMethodMeta<T[P]>
}

export type CurriedApiMeta<A extends Api> = {
	[P in keyof A]: CurriedTopicMeta<A[P]>
}

export type CurriedMethodAugmentation<M extends ClientMethod> =
	(...args: Shift<Parameters<M>>) => Promise<Await<ReturnType<M>>["result"]>

export type CurriedTopicAugmentation<T extends TopicClientside> = {
	[P in keyof T]: CurriedMethodAugmentation<T[P]>
}

export type CurriedApiAugmentation<A extends ApiClientside> = {
	[P in keyof A]: CurriedTopicAugmentation<A[P]>
}

export type ApiToClientside<A extends Api> = {
	[P in keyof A]: {
		[P2 in keyof A[P]]: (
			request: ClientRequest,
			...args: Parameters<A[P][P2]>
		) => Promise<ClientResponse<Await<ReturnType<A[P][P2]>>>>
	}
}

export type Augmentation<Context, Ret> = (context: Context) => Promise<(result: Ret) => Promise<ServerResponse<Ret>>>

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

export interface ServerRequest {
	headers: Headers
}

export interface ClientRequest {
	headers?: Headers
}

export type ServerResponse<R extends any = any> = {
	header?: Headers
	result: R
}

export type ClientResponse<R extends any = any> = {
	header: Headers
	result: R
}

export type ServerMethod = (request: ServerRequest, ...args: any[]) =>
	Promise<ServerResponse>

export type ClientMethod = (request: ClientRequest, ...args: any[]) =>
	Promise<ClientResponse>

export interface TopicServerside extends Topic {[key: string]: ServerMethod}
export interface TopicClientside extends Topic {[key: string]: ClientMethod}

export interface ApiServerside extends Api {[key: string]: TopicServerside}
export interface ApiClientside extends Api {[key: string]: TopicClientside}

//

export interface ApiServerOptions<A extends ApiServerside> {
	expose: A
	debug?: boolean
	logger?: Logger
}

export interface ApiClientOptions<A extends ApiClientside> {
	url: string
	shape: ApiShape<A>
}

//
