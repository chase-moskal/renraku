
import * as Koa from "koa"

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

export type Method = (...args: any[]) => Promise<any>

export type Topic = {
	[key: string]: Method
}

export type Api = {
	[key: string]: Topic
}

export type Constraint<C extends any, T extends C> = T

export const asApi = <A extends Api>(api: A) => api
export const asTopic = <T extends Topic>(topic: T) => topic
export const asMethod = <M extends Method>(method: M) => method

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

export interface Server {
	koa: Koa
	start(port: number): void
	stop(): Promise<void>
}

export interface CorsPermissions {
	allowed: RegExp
	forbidden: RegExp
}

export interface WhitelistPermissions {
	[key: string]: string
}

export interface BasicExposure<E extends Topic> {
	exposed: E
}

export interface CorsExposure<E extends Topic> extends BasicExposure<E> {
	cors: CorsPermissions
}

export interface WhitelistExposure<E extends Topic> extends BasicExposure<E> {
	whitelist: WhitelistPermissions
}

export type Exposure<E extends Topic> = CorsExposure<E> | WhitelistExposure<E>
export type UnknownExposure<E extends Topic = any> =
	BasicExposure<E> & Partial<CorsExposure<E>> & Partial<WhitelistExposure<E>>

export type ApiToExposures<A extends Api> = {
	[P in keyof A]: Exposure<A[P]>
}

export interface ServerOptions<A extends Api> {
	exposures: ApiToExposures<A>
	koa?: Koa
	debug?: boolean
	logger?: Logger
}

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
