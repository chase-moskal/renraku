
import {ApiError} from "./api-error.js"
import {obtain} from "../tools/obtain.js"
import {Api} from "../types/primitives/api.js"
import {Topic} from "../types/primitives/topic.js"
import {Responder} from "../types/api/responder.js"
import {JsonRpcId} from "../types/jsonrpc/json-rpc-id.js"
import {Procedure} from "../types/primitives/procedure.js"
import {RequestParser} from "../types/api/request-parser.js"
import {RequestAuthorizer} from "../types/api/request-authorizer.js"

export function makeApi<xRequest, xResponse, xAuth, xMeta>({expose, responder, parse, authorize}: {
		expose: Topic<xMeta>
		responder: Responder<xResponse>
		parse: RequestParser<xRequest, xAuth>
		authorize: RequestAuthorizer<xRequest, xAuth, xMeta>
	}): Api<xRequest, xResponse> {

	return async function api(request: xRequest): Promise<xResponse> {
		let errorRequestId: JsonRpcId = undefined
		try {
			const {requestId, specifier, auth, args} = parse(request)
			errorRequestId = requestId
			const meta = await authorize(request, auth)
			const procedure: Procedure<any, any[], any> = obtain(specifier, expose)
			const result = await procedure(meta, ...args)
			return responder.resultResponse(requestId, result)
		}
		catch (error) {
			if (error instanceof ApiError) {
				return responder.errorResponse(errorRequestId, error)
			}
			else {
				throw new ApiError(500, "error")
			}
		}
	}
}

export type RemoteProcedureCall<xAuth> = {
	requestId: JsonRpcId,
	specifier: string,
	auth: xAuth,
	args: any[],
}

export type PolicyOptions<xRequest, xResponse, xAuth, xMeta> = {
	responder: Responder<xResponse>
	parseRequest: (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
	processAuth: (auth: xAuth) => Promise<xMeta>
}

export type ToPolicy<xRequest, xResponse, xAuth, xMeta, xTopic extends Topic<xMeta>> =
	PolicyOptions<xRequest, xResponse, xAuth, xMeta>
	| {
		[P in keyof xTopic]: xTopic[P] extends Topic<xMeta>
			? PolicyOptions<xRequest, xResponse, xAuth, xMeta>
			: xTopic[P] extends {[key: string]: ToPolicy<xRequest, xResponse, xAuth, xMeta, Topic<xMeta>>}
				? {[key: string]: ToPolicy<xRequest, xResponse, xAuth, xMeta, Topic<xMeta>>}
				: never
	}

export type Policy<xRequest, xResponse, xAuth, xMeta, xTopic extends Topic<xMeta>> =
	PolicyOptions<xRequest, xResponse, xAuth, xMeta> | ToPolicy<xRequest, xResponse, xAuth, xMeta, xTopic>

export function asPolicy<xAuth, xMeta>() {
	return function<xRequest, xResponse, xTopic extends Topic<any>>(
			policy: Policy<xRequest, xResponse, xAuth, xMeta, xTopic>
		) {
		return policy
	}
}

export type ToPolicy2<xRequest, xResponse, xAuth, xMeta, xTopic extends Topic<xMeta>> = {
	[P in keyof xTopic]: xTopic[P] extends Topic<xMeta>
		? PolicyOptions<xRequest, xResponse, xAuth, xMeta>
		: xTopic[P] extends {[key: string]: ToPolicy<xRequest, xResponse, xAuth, xMeta, Topic<xMeta>>}
			? {[key: string]: ToPolicy<xRequest, xResponse, xAuth, xMeta, Topic<xMeta>>}
			: never
}

// export type Context<xRequest, xResponse, xAuth, xMeta, xTopic extends Topic<xMeta>> =
// 	[P in keyof xTopic]: xTopic[P] extends 
// 	{[key: string]: Context<xRequest, xResponse, any, any, xTopic>}
// 	| {
// 		topic: xTopic
// 		policy: PolicyOptions<xRequest, xResponse, xAuth, xMeta>
// 	}

export type Context<xRequest, xResponse, xAuth, xMeta, xTopic extends Topic<xMeta>> = {
	topic: xTopic
	policy: PolicyOptions<xRequest, xResponse, xAuth, xMeta>
}

export type ToContext<xRequest, xResponse, xTopic extends Topic<any>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<any, any[], any>
		? never
		: Context<xRequest, xResponse, any, any, any>
}

export function makeApi2<xRequest, xResponse>() {
	return function<xTopic extends Topic<any>>(
			expose: ToContext<xRequest, xResponse, xTopic>
		) {
		return expose
	}
}
