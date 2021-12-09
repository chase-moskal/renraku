
import {Policy, Methods, Expose, Api, Service, is_renraku_service} from "./types.js"

export const renrakuService = () => ({
	policy<xMeta, xAuth>(p: Policy<xMeta, xAuth>) {
		return {
			expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>): Service<xMeta, xAuth, xMethods> {
				return {
					[is_renraku_service]: is_renraku_service,
					expose: e,
					policy: p,
				}
			},
		}
	},
})

export function renrakuApi<xApi extends Api>(api: xApi): xApi {
	return api
}
