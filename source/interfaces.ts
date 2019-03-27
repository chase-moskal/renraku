
import {Logger} from "./toolbox/logflume/interfaces.js"

//
// SHAPE
//

export type Shape<T = {}> = {
	[P in keyof T]: boolean
}

export type ApiShape<A extends Api> = {
	[Topic in keyof A]: Shape<A[Topic]>
}

//
// API TOPICS
//

export type Api = { [topicName: string]: Topic }
export type Topic = { [functionName: string]: TopicFunction }
export type TopicFunction = (...args: any[]) => Promise<any>

export abstract class AbstractTopic implements Topic {
	[functionName: string]: TopicFunction
}

//
// SERVER
//

export interface Server {
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

export interface ServerOptions<A extends Api> {
	exposures: ServerExposures<A>
	debug?: boolean
	logger?: Logger
}

//
// CLIENT
//

export interface ClientOptions<A extends Api> {
	url: string
	shape: ApiShape<A>
	debug?: boolean
	logger?: Logger
}
