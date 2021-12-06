
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

// export function policy<xMeta, xAuth>(p: Policy<xMeta, xAuth>) {
// 	return {
// 		expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>) {
// 			return {
// 				[is_renraku_service]: is_renraku_service,
// 				expose: e,
// 				policy: p,
// 			}
// 		},
// 	}
// }

// service.

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

export function api<xApi extends Api>(setup: (s: typeof service) => xApi) {
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
			set: () => { throw new Error("remote is readonly") },
			get: (t, property: string) => async(...args: any[]) => {
				const auth = await getAuth()
				const methods = service.expose(auth)
				const method = methods[property]
				if (method)
					return method(...args)
				else
					throw new Error(`remote method "${property}" not found`)
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

export const mock = {
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

export function servelet(api: Api) {
	console.warn("TODO implement servelet")
	function receiveHttpRequest(request: any) {
		const method = request.method
		const headers = request.headers
	}
}

export const client = {
	link(url: string) {
		return {
			withMetaMap<xApi extends Api>(map: MetaMap<xApi>) {
				function recurse(mapGroup: MetaMap<xApi>, path: string[] = []): Remote<xApi> {
					return objectMap(mapGroup, (value, key) => {
						const newPath = [...path, key]
						const item = mapGroup[key]
						if (typeof item === "function") {
							// TODO lol finish recursion
						}
						else {
							return recurse(<any>item, newPath)
						}
					})
				}
				// const recurse2 = prepareRecursiveMapping(
				// 	(service, getter) => forService(service).withMeta(getter)
				// )
				// return <Remote<xApi>>recurse2(api, map)
			},
		}
	},
}

// export function shape<xApi extends Api>(shape: Shape<xApi>) {

// }

// export function client<xApi extends Api>(link: string): xApi {

// 	function recurse() {}

// 	return undefined
// }

const genius = api(service => ({
	math: {
		calculator: (
			service
				.policy(async(meta: {lotto: number}) => ({winner: meta.lotto === 9}))
				.expose(auth => ({
					async sum(x: number, y: number) {
						return x + y
					},
				}))
		)
	},
}))

const remoteCalculator1 = (
	mock
		.forService(genius.math.calculator)
		.withMeta(async() => ({lotto: 9}))
)

const remoteCalculator2 = (
	mock
		.forService(genius.math.calculator)
		.withAuth(async() => ({winner: true}))
)

const remoteGenius1 = (
	mock
		.forApi(genius)
		.withMetaMap({
			math: {
				calculator: async() => ({lotto: 9}),
			},
		})
)

const remoteGenius2 = (
	mock
		.forApi(genius)
		.withAuthMap({
			math: {
				calculator: async() => ({winner: true}),
			},
		})
)

const geniusServelet = servelet(genius)

const geniusClient = (
	client
		.link("https://api.xiome.io/")
		.withMetaMap({

		})
)
