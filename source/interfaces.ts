
export type Signature<T = {}> = {
	[P in keyof T]: any
}

export interface ApiSignature<A extends Api> {
	topics: {
		[P in keyof A["topics"]]: Signature<A["topics"][P]>
	}
}

export type Api<Topics = ApiTopics> = { topics: Topics }
export type ApiTopics = { [topicName: string]: ApiTopic }
export type ApiTopic = { [methodName: string]: ApiTopicMethod }
export type ApiTopicMethod = (...args: any[]) => Promise<any>

export abstract class AbstractApiTopic implements ApiTopic {
	[methodName: string]: ApiTopicMethod
}

export interface Permission {
	origin: RegExp
	allowedTopics: {
		[topicName: string]: string[]
	}
}

export interface ServerOptions<A> {
	callee: A
	permissions: Permission[]
}

export interface ConnectOptions<A extends Api> {
	serverUrl: string
	apiSignature: ApiSignature<A>
}

export interface ConnectResult<A> {
	callable: A
}
