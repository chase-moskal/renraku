
export interface Api {
	topics: {
		[topicName: string]: ApiTopic
	}
}

export interface ApiTopic {
	[methodName: string]: ApiTopicMethod
}

export interface ApiTopicMethod {
	(...args: any[]): Promise<any>
}

export interface Permission {
	origin: RegExp
	allowedTopics: {
		[topicName: string]: string[]
	}
}

export interface ServerOptions<gApi extends Api = Api> {
	callee: gApi
	permissions: Permission[]
}

export interface ConnectOptions {
	serverUrl: string
}
