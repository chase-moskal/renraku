
import {obtain} from "./tools/obtain.js"
import {ApiError} from "./api/api-error.js"
import {objectMap} from "./tools/object-map.js"
import {asTopic} from "./identities/as-topic.js"
import {RemoteProcedureCall} from "./api/make-api.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {parseJsonResponse} from "./jsonrpc/parse-json-response.js"

import {Await} from "./types/tools/await.js"
import {Api} from "./types/primitives/api.js"
import {Topic} from "./types/primitives/topic.js"
import {Responder} from "./types/api/responder.js"
import {DropFirst} from "./types/tools/drop-first.js"
import {Requester} from "./types/remote/requester.js"
import {HttpRequest} from "./types/http/http-request.js"
import {Procedure} from "./types/primitives/procedure.js"
import {HttpResponse} from "./types/http/http-response.js"
import {JsonRpcId} from "./types/jsonrpc/json-rpc-id.js"

//
// API CONTEXT
//

export type ParseRequest<xRequest, xAuth> = (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>

export type Comms<xRequest, xResponse, xAuth = any> = {
	responder: Responder<xResponse>
	parseRequest: ParseRequest<xRequest, xAuth>
}

export type Policy2<xAuth, xMeta> = {
	processAuth: (auth: xAuth) => Promise<xMeta>
}

export const _butter = Symbol()

export type ButteredProcedure<xAuth, xMeta, xArgs extends any[], xResult, xPolicy extends Policy2<xAuth, xMeta>> = {
	[_butter]: true
	policy: xPolicy
	func: Procedure<xMeta, xArgs, xResult>
}

function isFunction(value: any) {
	return typeof value === "function"
}

function isObject(value: any) {
	return value !== undefined
		&& value !== null
		&& typeof value === "object"
}

export const _context = Symbol()
export type ContextHint<xAuth> = {
	auth: xAuth
}

export type ApiContext<xAuth, xMeta, xTopic extends Topic<xMeta>, xPolicy extends Policy2<xAuth, xMeta>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<xMeta, any[], any>
		? ButteredProcedure<xAuth, xMeta, DropFirst<Parameters<xTopic[P]>>, Await<ReturnType<xTopic[P]>>, xPolicy>
		: xTopic[P] extends Topic<xMeta>
			? ApiContext<xAuth, xMeta, xTopic[P], xPolicy>
			: never
} & {[_context]: ContextHint<xAuth>}

export function prepareApi<xRequest, xResponse>(comms: Comms<xRequest, xResponse>) {
	return function<xAuth, xMeta>() {
		return function recurse<xPolicy extends Policy2<xAuth, xMeta>, xTopic extends Topic<xMeta>>(
				policy: xPolicy,
				topic: xTopic,
			): ApiContext<xAuth, xMeta, xTopic, xPolicy> {
			return objectMap(topic, (value, key) => {
				if (isFunction(value)) return <ButteredProcedure<xAuth, xMeta, any, any, xPolicy>>{
					[_butter]: true,
					policy,
					func: value,
				}
				else if (isObject(value)) return <ApiContext<xAuth, xMeta, xTopic, xPolicy>>{
					[_context]: true,
					...recurse(policy, value)
				}
				else throw new Error(`unknown value for "${key}"`)
			})
		}
	}
}

export const jsonResponder: Responder<HttpResponse> = {
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

// TODO write standard json parser
export const parseJsonRequest: ParseRequest<HttpRequest, any> = async request => undefined

export const prepareJsonApi = prepareApi<HttpRequest, HttpResponse>({
	responder: jsonResponder,
	parseRequest: parseJsonRequest,
})

type AlphaAuth = {token: string}
type AlphaMeta = {access: boolean}

type BravoAuth = {abc: string}
type BravoMeta = {tables: boolean}

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

const alphaPolicy: Policy2<AlphaAuth, AlphaMeta> = {
	processAuth: async auth => undefined
}

const bravoPolicy: Policy2<BravoAuth, BravoMeta> = {
	processAuth: async auth => undefined
}

const createContext = () => ({
	alpha: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha),
	bravo: prepareJsonApi<BravoAuth, BravoMeta>()(bravoPolicy, bravo),
	group: {
		alpha2: prepareJsonApi<AlphaAuth, AlphaMeta>()(alphaPolicy, alpha)
	},
})

type MyContext = ReturnType<typeof createContext>

//
// SHAPES
//

export type ApiGroupings = ApiContext<any, any, any, any> | {
	[key: string]: ApiContext<any, any, any, any> | ApiGroupings
}

export type Gravy<xAuth> = {
	getAuth: () => Promise<xAuth>
}

export const _gravy = Symbol()

export type OnlyButteredProcedures<T> = {
	[P in keyof T as T[P] extends ButteredProcedure<any, any, any[], any, any> ? P : never]: T[P]
}

export type ToShape<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ButteredProcedure<any, any, any[], any, any>
		? true
		: xGroupings[P] extends ApiGroupings
			? xGroupings[P] extends ApiContext<any, any, any, any>
				? {
					[_gravy]: Gravy<xGroupings[P][typeof _context]["auth"]>,
				} & {
					[P2 in keyof OnlyButteredProcedures<xGroupings[P]>]: true
				}
				: ToShape<xGroupings[P]>
			: never
}

const alphaGravy: Gravy<AlphaAuth> = {
	getAuth: async() => ({token: "t123"})
}

const bravoGravy: Gravy<BravoAuth> = {
	getAuth: async() => ({abc: "abc"})
}

const myShape: ToShape<MyContext> = {
	alpha: {
		[_gravy]: alphaGravy,
		sum: true,
	},
	bravo: {
		[_gravy]: bravoGravy,
		divide: true,
	},
	group: {
		alpha2: {
			[_gravy]: alphaGravy,
			sum: true,
		}
	},
}

//
// REMOTES
//

export type ToRemote<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ButteredProcedure<any, any, any[], any, any>
		? (...args: DropFirst<Parameters<xGroupings[P]["func"]>>) => ReturnType<xGroupings[P]["func"]>
		: xGroupings[P] extends ApiGroupings
			? ToRemote<xGroupings[P]>
			: never
}

export interface ShapeContext<xAuth> {
	[_gravy]: Gravy<xAuth>
	[key: string]: true | ShapeContext<xAuth>
}

export type ShapeGrouping<xAuth> = {
	[key: string]: ShapeContext<xAuth>
}

export function isShapeContext(shapeContext: ShapeContext<any>) {
	return isObject(shapeContext) && !!shapeContext[_gravy]
}

export function generateRemote<xGroupings extends ApiGroupings>({link, shape, requester}: {
		link: string
		shape: ToShape<xGroupings>
		requester: Requester<any>
	}): ToRemote<xGroupings> {
	return objectMap(shape, value => {
		if (isShapeContext(value)) {
			const {getAuth}: Gravy<any> = value[_gravy]
			function recurseOverContext(shapeContext: ShapeContext<any>): any {
				return objectMap(shapeContext, value2 => {
					if (value2 === true) {
						return async(...args: any[]) => {
							const auth = await getAuth()
							console.log("REMOTE CALL", {auth, args})
						}
					}
					else if (isObject(value2)) {
						return recurseOverContext(value2)
					}
				})
			}
			return recurseOverContext(value)
		}
		else if (isObject(value)) {
			return generateRemote({link, shape: value, requester})
		}
	})
}

const myRemote = generateRemote({
	link: "",
	shape: myShape,
	requester: async(options) => {}
})

;(async() => {
	const r1 = await myRemote.alpha.sum(1, 2)
	const r2 = await myRemote.group.alpha2.sum(2, 3)
	console.log(r1, r2)
})()

//
// SERVER
//

function isApiError(error: Error) {
	return typeof error === "number"
}

export function makeServelet<xRequest, xResponse, xGroupings extends ApiGroupings>({
		expose,
		responder,
		parseRequest,
	}: {
		expose: xGroupings
		responder: Responder<xResponse>
		parseRequest: ParseRequest<xRequest, any>
	}): Api<xRequest, xResponse> {

	return async function execute(request: xRequest): Promise<xResponse> {
		let errorRequestId: JsonRpcId
		try {
			const {requestId, specifier, auth, args} = await parseRequest(request)
			errorRequestId = requestId
			const {func, policy}: ButteredProcedure<any, any, any[], any, Policy2<any, any>> = obtain(specifier, expose)
			const meta = await policy.processAuth(auth)
			const result = await func(meta, ...args)
			return responder.resultResponse(requestId, result)
		}
		catch (error) {
			if (isApiError(error)) {
				return responder.errorResponse(errorRequestId, error)
			}
			else {
				throw new ApiError(500, "error")
			}
		}
	}
}

export function loopbackJsonRemote2<xGroupings extends ApiGroupings>({link, shape, servelet}: {
		link: string
		shape: ToShape<xGroupings>
		servelet: Api<HttpRequest, HttpResponse>
	}) {
	return generateRemote({
		link,
		shape,
		requester: async({args, link, auth, specifier}) => {
			const request = jsonHttpRequest({
				link,
				args,
				auth,
				specifier,
				headers: {},
			})
			const response = await servelet(request)
			return parseJsonResponse(response)
		},
	})
}
























// export type ToRemote<xContext extends ApiShape> = {
// 	[P in keyof xContext]: xContext[P] extends ApiContext<any, any, any, any>
// 		? {
// 			[P2 in keyof xContext[P]]: xContext[P][P2] extends ButteredProcedure<any, any, any[], any, any>
// 				? xContext[P][P2]
// 				: never
// 		}
// 		: never
// }

// export function generateRemote<xContext extends ApiShape>({link, shape}: {
// 		link: string
// 		shape: xContext
// 	}): ToRemote<xContext> {
// 	return objectMap(shape, (value, key) => {

// 	})
// }

// const alphaAuthPolicy = {getAuth: async() => ({token: "t123"})}
// const bravoAuthPolicy = {getAuth: async() => ({abc: "abc123"})}

// const remote = generateRemote<MyContext>({
// 	link,
// 	shape,
// })














//
// =====================================================================
// :::::: THE GRAVEYARD ::::::::::::::::::::::::::::::::::::::::::::::::
// =====================================================================
//

// export type Policy<xRequest, xResponse, xAuth, xMeta> = {
// 	responder: Responder<xResponse>
// 	parseRequest: (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
// 	processAuth: (auth: xAuth) => Promise<xMeta>
// }

// export type ContextStructure = {
// 	policy: Policy<any, any, any, any>
// 	procedure: Topic<any>
// } | {[key: string]: ContextStructure}

// export type ToContext<xMeta, xTopic extends Topic<xMeta>, xPolicy extends Policy<any, any, any, any>> = {
// 	[P in keyof xTopic]: xTopic[P] extends Procedure<xMeta, any[], any>
// 		? {
// 			policy: xPolicy
// 			procedure: xTopic[P]
// 		}
// 		: xTopic[P] extends Topic<xMeta>
// 			? ToContext<xMeta, xTopic[P], xPolicy>
// 			: never
// }

// export function makeContext<xAuth, xMeta>() {
// 	return function<xRequest, xResponse, xPolicy extends Policy<xRequest, xResponse, xAuth, xMeta>>(policy: xPolicy) {
// 		return function<xTopic extends Topic<xMeta>>(expose: xTopic): ToContext<xMeta, xTopic, xPolicy> {
// 			throw new Error("TODO implement")
// 			return undefined
// 		}
// 	}
// }



// const remote = generateRemote<ReturnType<typeof createContext>>({
// 	shape: {
// 		alpha: {
// 			[_gravy]: alphaAuthPolicy,
// 			sum: true,
// 		},
// 		bravo: {
// 			[_gravy]: bravoAuthPolicy,
// 			divide: true,
// 		},
// 		group: {
// 			alpha2: {
// 				[_gravy]: alphaAuthPolicy,
// 				sum: true,
// 			},
// 		},
// 	},
// })




// export type ContextToShape<xContext extends ApiContext<any, any, any, any>> = {
// 	[P in keyof xContext]: xContext[P] extends ButteredProcedure<any, any, any[], any, xPolicy>
// 		? true
// 		: xContext[P] extends ApiContext<any, any, any, any>
// 			? ContextToShape<xContext[P]>
// 			: never
// }

// const shape: ContextToShape<ReturnType<typeof createContext>> = {
// 	alpha: {
// 		sum: true,
// 	},
// 	bravo: {
// 		divide: true,
// 	},
// 	group: {
// 		alpha2: {
// 			sum: true,
// 		},
// 	}
// }

// export function generateRemote<xContext extends ApiContext<any, any, any, any>>(context: xContext) {

// }









// //
// // hmmm... not so sure about this stuff below
// //

// export type ApiGroups = {
// 	[key: string]: ButteredProcedure<any, any, any[], any> | ApiGroups
// }

// export type Remotify<xGroups extends ApiGroups> = {
// 	[P in keyof xGroups]: xGroups[P] extends ButteredProcedure<any, any, any[], any>
// 		? (...args: DropFirst<Parameters<xGroups[P]["func"]>>) => ReturnType<xGroups[P]["func"]>
// 		: xGroups[P] extends ApiGroups
// 			? Remotify<xGroups[P]>
// 			: never
// }

// export function produceRemote<xGroups extends ApiGroups>(groups: xGroups): Remotify<xGroups> {
// 	return objectMap(groups, (value, key) => {
// 		if (isButtered(value)) {
// 			const {policy, func} = <ButteredProcedure<any, any, any, any>>value
// 			return (...args: any[]) => {
// 				// TODO perform request to api source
// 				// apply the policy
// 			}
// 		}
// 		else if (isObject(value)) {
// 			return produceRemote(value)
// 		}
// 		else throw new Error(`unknown group value for "${key}"`)
// 	})
// }

// const remote = produceRemote(createContext())

// remote.alpha.sum






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







// export type MakeContext<xRequest, xResponse> =
// 	<xAuth, xMeta>() =>
// 		<xPolicy extends Policy<xRequest, xResponse, xAuth, xMeta>>(policy: xPolicy) =>
// 			<xTopic extends Topic<xMeta>>(topic: Topic<xMeta>) =>
// 				ToContext<xMeta, xTopic, xPolicy>

// export type Contextualize<xRequest, xResponse> =
// 	(context: MakeContext<xRequest, xResponse>) => ToContext<any, any, any>

// export function makeContext2<xRequest, xResponse>(contextualize: Contextualize<xRequest, xResponse>) {
// 	return contextualize(() => policy => topic => {
// 		return undefined
// 	})
// }

// const supercontext = makeContext2<HttpRequest, HttpResponse>(context => ({
// 	alpha: context<AlphaAuth, AlphaMeta>()(alphaPolicy)({
// 		async echo({access}, data: any) {
// 			return data
// 		},
// 		async sum({access}, x: number, y: number) {
// 			return x + y
// 		},
// 		async divide({access}, x: number, y: number) {
// 			if (y === 0) throw new Error("cannot divide by 0")
// 			return x / y
// 		}
// 	})
// }))

// supercontext.alpha.sum.procedure({access: true}, 1, 2)










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
