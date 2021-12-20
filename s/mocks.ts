
import {RenrakuError} from "./error.js"
import {objectMap} from "./tools/object-map.js"
import {Api, RenrakuMetaMap, ApiRemote, AuthMap, Service, Methods, is_renraku_service, RenrakuHttpHeaders} from "./types.js"

export const renrakuMock = () => ({
	forService,
	forApi<xApi extends Api>(api: xApi) {
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
			service: Service<any, any, Methods>,
			getter: () => Promise<any>
		) => Methods
	) {
	return function recursiveMapping(
			apiGroup: Api,
			mapGroup: RenrakuMetaMap<Api> | AuthMap<Api>,
		): ApiRemote<Api> {
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
