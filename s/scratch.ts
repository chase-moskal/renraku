
import {obtain} from "./tools/obtain.js"
import {ApiError} from "./api/api-error.js"
import {objectMap} from "./tools/object-map.js"
import {asTopic} from "./identities/as-topic.js"
import {jsonHttpRequest} from "./jsonrpc/json-http-request.js"
import {parseJsonResponse} from "./jsonrpc/parse-json-response.js"

import {Await} from "./types/tools/await.js"
import {Topic} from "./types/primitives/topic.js"
import {Responder} from "./types/api/responder.js"
import {DropFirst} from "./types/tools/drop-first.js"
import {Requester} from "./types/remote/requester.js"
import {Servelet} from "./types/primitives/servelet.js"
import {JsonRpcId} from "./types/jsonrpc/json-rpc-id.js"
import {HttpRequest} from "./types/http/http-request.js"
import {Procedure} from "./types/primitives/procedure.js"
import {HttpResponse} from "./types/http/http-response.js"
import {RemoteProcedureCall} from "./types/api/remote-procedure-call.js"
import { parseJsonRequest } from "./jsonrpc/parse-json-request.js"
import { makeJsonHttpResponder } from "./jsonrpc/json-http-responder.js"

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

export const prepareJsonApi = prepareApi<HttpRequest, HttpResponse>({
	responder: makeJsonHttpResponder({headers: {}}),
	parseRequest: parseJsonRequest,
})

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

export function generateRemote<xGroupings extends ApiGroupings>({link, shape, specpath = [], requester}: {
		link: string
		shape: ToShape<xGroupings>
		specpath?: string[]
		requester: Requester<any>
	}): ToRemote<xGroupings> {
	return objectMap(shape, (value, key) => {
		if (isShapeContext(value)) {
			const {getAuth}: Gravy<any> = value[_gravy]
			function recurseOverContext(shapeContext: ShapeContext<any>, subpath: string[] = []): any {
				return objectMap(shapeContext, (value2, key2) => {
					if (value2 === true) {
						return async(...args: any[]) => {
							const specifier = [...specpath, ...subpath, key, key2].join(".")
							const auth = await getAuth()
							const result = await requester({
								link,
								args,
								auth,
								specifier,
							})
							return result
						}
					}
					else if (isObject(value2)) {
						return recurseOverContext(value2, [...subpath, key2])
					}
				})
			}
			return recurseOverContext(value)
		}
		else if (isObject(value)) {
			return generateRemote({
				link,
				shape: value,
				specpath: [...specpath, key],
				requester,
			})
		}
	})
}

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
	}): Servelet<xRequest, xResponse> {

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
		servelet: Servelet<HttpRequest, HttpResponse>
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
