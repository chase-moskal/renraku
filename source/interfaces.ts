
//
// SHAPE
//

export type ApiShape<A extends Api> = {
	[Topic in keyof A]: Shape<A[Topic]>
}

export type Shape<T = {}> = {
	[P in keyof T]: boolean
}

//
// API TOPICS
//

export type Api = { [topicName: string]: ApiTopic }
export type ApiTopic = { [functionName: string]: ApiTopicFunction }
export type ApiTopicFunction = (...args: any[]) => Promise<any>

export abstract class AbstractApiTopic implements ApiTopic {
	[functionName: string]: ApiTopicFunction
}

//
// SERVER
//

export interface Server {
	start(port: number): void
	stop(): void
}

export interface ServerExposure<A extends Api> {
	allowed: RegExp
	forbidden: RegExp
	exposed: A
}

export type ServerOptions<A extends Api> = ServerExposure<A>[]

//
// CLIENT
//

export interface ClientOptions<A extends Api> {
	url: string
	shape: ApiShape<A>
}
