
import {asTopic} from "./identities/as-topic.js"
import {Responder} from "./types/api/responder.js"
import {RemoteProcedureCall} from "./api/make-api.js"

import {Topic} from "./types/primitives/topic.js"
import {HttpRequest} from "./types/http/http-request.js"
import {Procedure} from "./types/primitives/procedure.js"
import {HttpResponse} from "./types/http/http-response.js"
import { objectMap } from "./tools/object-map.js"

export type AlphaAuth = {token: string}
export type AlphaMeta = {access: boolean}

export type BravoAuth = {abc: string}
export type BravoMeta = {tables: boolean}

export type Policy<xRequest, xResponse, xAuth, xMeta> = {
	responder: Responder<xResponse>
	parseRequest: (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
	processAuth: (auth: xAuth) => Promise<xMeta>
}

// export type ContextStructure = {
// 	policy: Policy<any, any, any, any>
// 	procedure: Topic<any>
// } | {[key: string]: ContextStructure}

export type ToContext<xMeta, xTopic extends Topic<xMeta>, xPolicy extends Policy<any, any, any, any>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<xMeta, any[], any>
		? {
			policy: xPolicy
			procedure: xTopic[P]
		}
		: xTopic[P] extends Topic<xMeta>
			? ToContext<xMeta, xTopic[P], xPolicy>
			: never
}

export function makeContext<xAuth, xMeta>() {
	return function<xRequest, xResponse, xPolicy extends Policy<xRequest, xResponse, xAuth, xMeta>>(policy: xPolicy) {
		return function<xTopic extends Topic<xMeta>>(expose: xTopic): ToContext<xMeta, xTopic, xPolicy> {
			throw new Error("TODO implement")
			return undefined
		}
	}
}

const responder: Responder<HttpResponse> = {
	resultResponse: (requestId, result) => ({
		body: "",
		status: 123,
		headers: {"Content-Type": "application/json"},
	}),
	errorResponse: (requestId, error) => ({
		body: "",
		status: 123,
		headers: {"Content-Type": "application/json"},
	}),
}

const alphaPolicy: Policy<HttpRequest, HttpResponse, AlphaAuth, AlphaMeta> = {
	responder,
	parseRequest: async request => undefined,
	processAuth: async auth => (undefined),
}

const bravoPolicy: Policy<HttpRequest, HttpResponse, BravoAuth, BravoMeta> = {
	responder,
	parseRequest: async request => undefined,
	processAuth: async auth => undefined,
}

const alpha = asTopic<AlphaMeta>()({
	async sum(meta, x: number, y: number) {
		return x + y
	},
})

const bravo = asTopic<BravoMeta>()({
	async divide(meta, x: number, y: number) {
		return x / y
	},
})


//
// TODO continue this new thread
//

export type Comms<xRequest, xResponse, xAuth = any> = {
	responder: Responder<xResponse>
	parseRequest: (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
}

export type Policy2<xAuth, xMeta> = {
	processAuth: (auth: xAuth) => Promise<xMeta>
}

export const _butter = Symbol()

export type ButteredProcedure<xAuth, xMeta> = {
	[_butter]: true
	policy: Policy2<xAuth, xMeta>
	func: Procedure<xMeta, any[], any>
}

export type ApiContext<xAuth, xMeta, xTopic extends Topic<xMeta>, xPolicy extends Policy2<xAuth, xMeta>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<xMeta, any[], any>
		? ButteredProcedure<xAuth, xMeta>
		: xTopic[P] extends Topic<xMeta>
			? ApiContext<xAuth, xMeta, xTopic[P], xPolicy>
			: never
}

export function prepareApi<xRequest, xResponse>(comms: Comms<xRequest, xResponse>) {
	return function<xAuth, xMeta>() {
		return function recurse<xPolicy extends Policy2<xAuth, xMeta>, xTopic extends Topic<xMeta>>(policy: xPolicy, topic: xTopic): ApiContext<xAuth, xMeta, xTopic, xPolicy> {
			return objectMap(topic, (value, key) => {
				if (typeof value === "function") {
					return <ButteredProcedure<xAuth, xMeta>>{
						policy,
						func: value,
						[_butter]: true,
					}
				}
				else if (value !== undefined && value !== null && typeof value === "object") {
					return recurse(value, policy)
				}
				else {
					throw new Error(`unknown value for "${key}"`)
				}
			})
		}
	}
}

const prepareJsonApi = prepareApi<HttpRequest, HttpResponse>({
	responder,
	parseRequest: async request => undefined,
})

const context = {
	alpha: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha),
	bravo: prepareJsonApi<BravoAuth, BravoMeta>()(bravoPolicy, bravo),
	group: {
		alpha2: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha)
	},
}






// const alpha = makeContext<AlphaAuth, AlphaMeta>()(alphaPolicy)({
// 	async echo({access}, data: any) {
// 		return data
// 	},
// 	async sum({access}, x: number, y: number) {
// 		return x + y
// 	},
// 	async divide({access}, x: number, y: number) {
// 		if (y === 0) throw new Error("cannot divide by 0")
// 		return x / y
// 	}
// })

// const bravo = makeContext<BravoAuth, BravoMeta>()(bravoPolicy)({
// 	async sayHi({tables}, nameToGreet: string) {
// 		return `Hi, ${nameToGreet}!`
// 	},
// })

// alpha.sum.procedure({access: true}, 1, 2)
// bravo.sayHi.procedure({tables: true}, "Chase")







export type MakeContext<xRequest, xResponse> =
	<xAuth, xMeta>() =>
		<xPolicy extends Policy<xRequest, xResponse, xAuth, xMeta>>(policy: xPolicy) =>
			<xTopic extends Topic<xMeta>>(topic: Topic<xMeta>) =>
				ToContext<xMeta, xTopic, xPolicy>

export type Contextualize<xRequest, xResponse> =
	(context: MakeContext<xRequest, xResponse>) => ToContext<any, any, any>

export function makeContext2<xRequest, xResponse>(contextualize: Contextualize<xRequest, xResponse>) {
	return contextualize(() => policy => topic => {
		return undefined
	})
}

const supercontext = makeContext2<HttpRequest, HttpResponse>(context => ({
	alpha: context<AlphaAuth, AlphaMeta>()(alphaPolicy)({
		async echo({access}, data: any) {
			return data
		},
		async sum({access}, x: number, y: number) {
			return x + y
		},
		async divide({access}, x: number, y: number) {
			if (y === 0) throw new Error("cannot divide by 0")
			return x / y
		}
	})
}))

supercontext.alpha.sum.procedure({access: true}, 1, 2)










// export const alternative = asTopic<BravoMeta>()({
// 	async sayHi({tables}, nameToGreet: string) {
// 		return `Hi, ${nameToGreet}!`
// 	},
// })

// export const supertopic = () => ({
// 	math,
// 	alternative,
// })

// export type Supertopic = ReturnType<typeof supertopic>

// const api = makeApi2<HttpRequest, HttpResponse>()<Supertopic>({
// 	expose: {
// 		math: {
// 			topic: math,
// 			policy: {
// 				parseRequest: async(request) => {},
// 				processAuth: async(request, auth) => {},
// 				responders: {
// 					resultResponse: (requestId, result) => ({
// 						body: "",
// 						status: 123,
// 						headers: {"Content-Type": "application/json"},
// 					}),
// 					errorResponse: (requestId, error) => ({
// 						body: "",
// 						status: 123,
// 						headers: {"Content-Type": "application/json"},
// 					}),
// 				},
// 			},
// 		}
// 	},
// })
