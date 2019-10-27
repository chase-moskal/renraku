
import * as Koa from "koa"
import {Logger} from "./toolbox/logging.js"

//
// TOPICS
//

export type TopicMethod = (...args: any[]) => Promise<any>
export type Topic<X = {}> = {[func in keyof X]: TopicMethod}
export type TopicApi<X extends {} = {}> = {[topicName in keyof X]: Topic}

//
// SHAPES
//

export type Shape<T = {}> = {
	[P in keyof T]: boolean
}

export type ApiShape<A extends TopicApi> = {
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

export interface Order {
	topic: string
	func: string
	params: any[]
}

export interface Exposure<T extends Topic = Topic> {
	exposed: T
	cors?: {
		allowed: RegExp
		forbidden: RegExp
	},
	whitelist?: {
		[key: string]: string
	}
}

export type ApiToExposures<A extends TopicApi = TopicApi> = {
	[P in keyof A]: Exposure<A[P]>
}

export interface ServerOptions<A extends TopicApi = {}> {
	debug: boolean
	topics: ApiToExposures<A>
	koa?: Koa
	logger?: Logger
}

//
// CLIENT
//

export interface ClientOptions<A extends TopicApi> {
	url: string
	shape: ApiShape<A>
}
