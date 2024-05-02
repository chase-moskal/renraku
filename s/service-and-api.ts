
import {Policy, Methods, Expose, Api, Service, is_service} from "./types.js"

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

/** declare a service with no auth policy */
export const serviette = service().policy(async() => {}).expose

export function api<xApi extends Api>(api: xApi): xApi {
	return api
}

