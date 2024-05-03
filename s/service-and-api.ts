
import {Policy, Methods, Expose, Api, Service, is_service, MetaMap} from "./types.js"

export const service = () => ({
	policy<xMeta, xAuth>(p: Policy<xMeta, xAuth>) {
		return {
			expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>): Service<xMeta, xAuth, xMethods> {
				return {
					[is_service]: true,
					expose: e,
					policy: p,
				}
			},
		}
	},
})

export function api<xApi extends Api>(api: xApi): xApi {
	return api
}

/** declare a service with no auth policy */
export const serviette = service().policy(async() => {}).expose

export function metaMap<xApi extends Api>(m: MetaMap<xApi>) {
	return m
}

