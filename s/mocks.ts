
import {RenrakuError} from "./error.js"
import {objectMap} from "./tools/object-map.js"
import {RenrakuApi, RenrakuMetaMap, ApiRemote, AuthMap, RenrakuService, Methods, is_renraku_service, RenrakuHttpHeaders} from "./types.js"

export const renrakuMock = () => ({
	forService,
	forApi<xApi extends RenrakuApi>(api: xApi) {
		return {
			withMetaMap(
					map: RenrakuMetaMap<xApi>,
					getHeaders: () => Promise<RenrakuHttpHeaders> = async() => undefined
				): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter) => forService(service).withMeta(getter, getHeaders)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
			withAuthMap(map: AuthMap<xApi>): ApiRemote<xApi> {
				const recurse2 = prepareRecursiveMapping(
					(service, getter) => forService(service).withAuth(getter)
				)
				return <ApiRemote<xApi>>recurse2(api, map)
			},
		}
	},
})

function forService<xService extends RenrakuService<any, any, Methods>>(service: xService) {
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
		return new Proxy(<xMethods>{}, {
			set: () => { throw new RenrakuError(400, "renraku remote is readonly") },
			get: (t, property: string) => async(...args: any[]) => {
				const auth = await getAuth()
				const methods = service.expose(auth)
				const method = methods[property]
				if (method)
					return method(...args)
				else
					throw new RenrakuError(400, `renraku remote method "${property}" not found`)
			},
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
			getter: () => Promise<any>
		) => Methods
	) {
	return function recursiveMapping(
			apiGroup: RenrakuApi,
			mapGroup: RenrakuMetaMap<RenrakuApi> | AuthMap<RenrakuApi>,
		): ApiRemote<RenrakuApi> {
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
