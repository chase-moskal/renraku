
import * as Koa from "koa"
import {Logger} from "./toolbox/logging.js"


//
// API TOPICS
//

export type TopicFunction = (...args: any[]) => Promise<any>
export type Topic<X = {}> = { [functionName in keyof X]: TopicFunction }
export type Api<X = {}> = { [topicName in keyof X]: Topic<X[topicName]> }

//
// SHAPE
//

export type Shape<T = {}> = {
	[P in keyof T]: boolean
}

export type ApiShape<A extends Api> = {
	[topicName in keyof A]: Shape<A[topicName]>
}

//
// SERVER
//

export interface Server {
	koa: Koa
	start(port: number): void
	stop(): Promise<void>
}

export interface ServerExposure<A extends Api> {
	allowed: RegExp
	forbidden: RegExp
	exposed: A
}

export type ServerExposures<A extends Api> = ServerExposure<A>[]

export interface RequestBody {
	topic: string
	func: string
	params: any[]
}

export interface ServerOptions<A extends Api = Api> {
	exposures: ServerExposures<A>
	koa?: Koa
	debug?: boolean
	logger?: Logger
}

//
// CLIENT
//

export interface ClientOptions<A extends Api> {
	url: string
	shape: ApiShape<A>
}
