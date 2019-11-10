
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

export type Methods<T extends {} = {}> = {
	[P in keyof T]: (...args: any[]) => Promise<any>
}

export interface Topic {
	methods: Methods
}

export type Api<T extends {} = {}> = {
	[P in keyof T]: Topic
}

//
// SHAPES
//

export type Shape<T = {}> = {
	[P in keyof T]: boolean
}

export type ApiShape<A extends Api<A> = Api> = {
	[P in keyof A]: {
		methods: Shape<A[P]["methods"]>
	}
}

//
// SERVER
//

export interface Server {
	koa: Koa
	start(port: number): void
	stop(): Promise<void>
}

export interface Exposure<M extends Methods = Methods> {
	methods: M
	cors?: {
		allowed: RegExp
		forbidden: RegExp
	},
	whitelist?: {
		[key: string]: string
	}
}

export type ApiToExposures<A extends Api<A> = Api> = {
	[P in keyof A]: Exposure<A[P]["methods"]>
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
