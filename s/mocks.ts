
import {RenrakuError} from "./error.js"
import {objectMap} from "./tools/object-map.js"
import {RenrakuApi, RenrakuMetaMap, ApiRemote, AuthMap, RenrakuService, Methods, is_renraku_service, RenrakuHttpHeaders, RenrakuServiceOptions} from "./types.js"

export const renrakuMock = (options: RenrakuServiceOptions = {}) => ({
	forService: <xService extends RenrakuService<any, any, Methods>>(
			service: xService
		) => mockService(service, [], options),
	forApi<xApi extends RenrakuApi>(api: xApi) {
		return {
			withMetaMap(
					map: RenrakuMetaMap<xApi>,
					getHeaders: () => Promise<RenrakuHttpHeaders> = async() => undefined
				): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter, path) => mockService(service, path, options).withMeta(getter, getHeaders)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
			withAuthMap(map: AuthMap<xApi>): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter, path) => mockService(service, path, options).withAuth(getter)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
		}
	},
})

function mockService<xService extends RenrakuService<any, any, Methods>>(service: xService, path: string[], options: RenrakuServiceOptions) {
	type xMeta = xService extends RenrakuService<infer X, any, Methods>
		? X
		: never
	type xAuth = xService extends RenrakuService<any, infer X, Methods>
		? X
		: never
	type xMethods = xService extends RenrakuService<any, any, infer X>
		? X
		: never
	function prepareProxy(getAuth: () => Promise<xAuth>): xMethods {
		const overrides: {[key: string]: any} = {}
		return new Proxy(<xMethods>{}, {
			set: (t, key: string, value: any) => {
				overrides[key] = value
				return true
			},
			get: (t, key: string) => (
				overrides[key] ?? (async(...params: any[]) => {
					const auth = await getAuth()
					const method = service.expose(auth)[key]
					if (method) {
						return options.spike
							? options.spike([...path, key].join("."), method, ...params)
							: method(...params)
					}
					else
						throw new RenrakuError(400, `renraku remote method "${key}" not found`)
				})
			),
		})
	}
	return {
		withMeta(
				getMeta: () => Promise<xMeta>,
				getHeaders: () => Promise<RenrakuHttpHeaders> = async() => undefined
			): xMethods {
			return prepareProxy(
				async() => service.policy(
					await getMeta(),
					await getHeaders()
				)
			)
		},
		withAuth(getAuth: () => Promise<xAuth>): xMethods {
			return prepareProxy(getAuth)
		},
	}
}

function prepareRecursiveMapping(
		handler: (
			service: RenrakuService<any, any, Methods>,
			getter: () => Promise<any>,
			path: string[]
		) => Methods
	) {
	return function recursiveMapping(
			apiGroup: RenrakuApi,
			mapGroup: RenrakuMetaMap<RenrakuApi> | AuthMap<RenrakuApi>,
			path: string[] = []
		): ApiRemote<RenrakuApi> {
		return objectMap(apiGroup, (value, key) => {
			const newPath = [...path, key]
			if (value[is_renraku_service]) {
				const service = value
				return handler(service, mapGroup[key], newPath)
			}
			else {
				const nextApiGroup = value
				const nextMapGroup = mapGroup[key]
				return recursiveMapping(nextApiGroup, nextMapGroup, newPath)
			}
		})
	}
}
