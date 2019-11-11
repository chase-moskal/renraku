
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

export type Topic<T extends {} = {}> = {
	[P in keyof T]: Method
}

export type Api<T extends {} = {}> = {
	[P in keyof T]: Topic
}

//
// SHAPES
//

export type Shape<T = {}> = {
	[P in keyof T]: T[P] extends Method
		? "method"
		: never
}

export type ApiShape<A extends Api<A> = Api> = {
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

export type ApiToExposures<A extends Api<A> = Api> = {
	[P in keyof A]: Exposure<A[P]>
}

export interface ServerOptions<A extends Api<A> = Api> {
	exposures: ApiToExposures<A>
	koa?: Koa
	debug?: boolean
	logger?: Logger
}

//
// CLIENT
//

export interface ClientOptions<A extends Api<A> = Api> {
	url: string
	shape: ApiShape<A>
}
