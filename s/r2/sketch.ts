
import {obtain} from "../tools/obtain.js"
import {objectMap} from "../tools/object-map.js"

export interface Methods {
	[key: string]: (...args: any[]) => Promise<any>
}

export interface Policy<xMeta, xAuth> {
	(meta: xMeta): Promise<xAuth>
}

export interface Expose<xAuth, xMethods extends Methods> {
	(auth: xAuth): xMethods
}

export const is_renraku_service = Symbol("is_renraku_service")

export interface Service<xMeta, xAuth, xMethods extends Methods> {
	[is_renraku_service]: symbol
	policy: Policy<xMeta, xAuth>
	expose: Expose<xAuth, xMethods>
}

export const service = {
	policy<xMeta, xAuth>(p: Policy<xMeta, xAuth>) {
		return {
			expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>) {
				return {
					[is_renraku_service]: is_renraku_service,
					expose: e,
					policy: p,
				}
			},
		}
	},
}

export interface Api {
	[key: string]: Api | Service<any, any, Methods>
}

export function renrakuApi<xApi extends Api>(setup: (s: typeof service) => xApi) {
	return setup(service)
}

export type MetaMap<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<infer xMeta, any, Methods>
		? () => Promise<xMeta>
		: xApi[P] extends Api
			? MetaMap<xApi[P]>
			: never
}

export type AuthMap<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<any, infer xAuth, Methods>
		? () => Promise<xAuth>
		: xApi[P] extends Api
			? AuthMap<xApi[P]>
			: never
}

export type Remote<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<any, any, infer xMethods>
		? xMethods
		: xApi[P] extends Api
			? Remote<xApi[P]>
			: never
}

function forService<xService extends Service<any, any, Methods>>(service: xService) {
	type xMeta = xService extends Service<infer X, any, Methods>
		? X
		: never
	type xAuth = xService extends Service<any, infer X, Methods>
		? X
		: never
	type xMethods = xService extends Service<any, any, infer X>
		? X
		: never
	function prepareProxy(getAuth: () => Promise<xAuth>): xMethods {
		return new Proxy(<xMethods>{}, {
			set: () => { throw new Error("renraku remote is readonly") },
			get: (t, property: string) => async(...args: any[]) => {
				const auth = await getAuth()
				const methods = service.expose(auth)
				const method = methods[property]
				if (method)
					return method(...args)
				else
					throw new Error(`renraku remote method "${property}" not found`)
			},
		})
	}
	return {
		withMeta(getMeta: () => Promise<xMeta>): xMethods {
			return prepareProxy(async() => service.policy(await getMeta()))
		},
		withAuth(getAuth: () => Promise<xAuth>): xMethods {
			return prepareProxy(getAuth)
		},
	}
}

function prepareRecursiveMapping(
		handler: (
			service: Service<any, any, Methods>,
			getter: () => Promise<any>
		) => Methods
	) {
	return function recursiveMapping(
			apiGroup: Api,
			mapGroup: MetaMap<Api> | AuthMap<Api>,
		): Remote<Api> {
		return objectMap(apiGroup, (value, key) => {
			if (value[is_renraku_service]) {
				const service = value
				return handler(service, mapGroup[key])
			}
			else {
				const nextApiGroup = value
				const nextMapGroup = mapGroup[key]
				return recursiveMapping(nextApiGroup, nextMapGroup)
			}
		})
	}
}

export const renrakuMock = {
	forService,
	forApi<xApi extends Api>(api: xApi) {
		return {
			withMetaMap(map: MetaMap<xApi>): Remote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter) => forService(service).withMeta(getter)
				)
				return <Remote<xApi>>recurse2(api, map)
			},
			withAuthMap(map: AuthMap<xApi>): Remote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter) => forService(service).withAuth(getter)
				)
				return <Remote<xApi>>recurse2(api, map)
			},
		}
	},
}

export interface Request {
	meta: any
	method: string
	params: any[]
}

export interface Response {
	result: any
}

export interface Requester {
	(request: Request): Promise<any>
}

export interface JsonRpcRequest {
	jsonrpc: "2.0"
	method: string
	params: any[]
	id: number
}

export interface JsonRpcResponse {
	jsonrpc: "2.0"
	result: any
	error: {
		code: number
		message: string
	}
	id: number
}

export interface Servelet {
	(request: Request): Promise<any>
}

export const renrakuServer = {
	forApi: (api: Api) => {
		async function servelet(request: Request) {
			const servicePath = request.method.slice(1).split(".")
			const methodName = servicePath.pop()
			const service: Service<any, any, Methods> = obtain(servicePath.join("."), api)
			if (!service)
				throw new Error(`renraku service not found "${servicePath}"`)
			const auth = await service.policy(request.meta)
			const methods = service.expose(auth)
			const executor = methods[methodName]
			if (!executor)
				throw new Error(`renraku method "${methodName}" not found on service "${servicePath}"`)
			return executor(...request.params)
		}
		return {
			httpJsonRpc: (port: number) => {
				// TODO implement server
				return {
					stop() {},
				}
			},
		}
	},
}

export const renrakuBrowserRequesters = {
	httpJsonRpc: (link: string): Requester => {
		let count = 0
		return async function requester({meta, method, params}) {
			const response: JsonRpcResponse = await fetch(link, {
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "omit",
				redirect: "follow",
				referrerPolicy: "no-referrer",
				headers: {

					// sent as plain text, to avoid cors "options" preflight requests,
					// by qualifying as a cors "simple request"
					"Content-Type": "text/plain; charset=utf-8",

					"Authorization": JSON.stringify(meta),
				},
				body: JSON.stringify(<JsonRpcRequest>{
					jsonrpc: "2.0",
					method,
					params,
					id: count++,
				})
			}).then(r => r.json())
			if (response.error)
				throw new Error(`remote call error: ${response.error.code} ${response.error.message} (from "${link}")`)
			else
				return response.result
		}
	},
}

export const renrakuClient = {
	usingRequester(requester: Requester) {
		return {
			withMetaMap<xApi extends Api>(map: MetaMap<xApi>) {
				function recurse(mapGroup: MetaMap<xApi>, path: string[] = []): Remote<xApi> {
					return objectMap(mapGroup, (value, key) => {
						const newPath = [...path, key]
						const item = mapGroup[key]
						if (typeof item === "function") {
							const getMeta: () => Promise<any> = item
							return new Proxy({}, {
								set: () => { throw new Error("renraku remote is readonly") },
								get: (target, property: string) => async(...params: any[]) => {
									const method = "." + [...newPath, property].join(".")
									const meta = await getMeta()
									return requester({meta, method, params})
								},
							})
						}
						else {
							return recurse(<any>item, newPath)
						}
					})
				}
				return recurse(map)
			},
		}
	},
}

//
//
//

const geniusApi = renrakuApi(renrakuService => ({
	math: {
		calculator: renrakuService
			.policy(async(meta: {lotto: number}) => ({winner: meta.lotto === 9}))
			.expose(auth => ({
				async sum(x: number, y: number) {
					return x + y
				},
			})),
	},
}))

const remoteCalculator1 = renrakuMock
	.forService(geniusApi.math.calculator)
	.withMeta(async() => ({lotto: 9}))

const remoteCalculator2 = renrakuMock
	.forService(geniusApi.math.calculator)
	.withAuth(async() => ({winner: true}))

const remoteGenius1 = renrakuMock
	.forApi(geniusApi)
	.withMetaMap({
		math: {
			calculator: async() => ({lotto: 9}),
		},
	})

const remoteGenius2 = renrakuMock
	.forApi(geniusApi)
	.withAuthMap({
		math: {
			calculator: async() => ({winner: true}),
		},
	})

const server = renrakuServer
	.forApi(geniusApi)
	.httpJsonRpc(8000)

const geniusClient = renrakuClient
	.usingRequester(renrakuBrowserRequesters.httpJsonRpc("https://api.xiome.io/"))
	.withMetaMap<typeof geniusApi>({
		math: {
			calculator: async() => ({lotto: 5}),
		},
	})
