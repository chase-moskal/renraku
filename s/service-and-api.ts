
import {RenrakuPolicy, Methods, Expose, RenrakuApi, RenrakuService, is_renraku_service} from "./types.js"

export const renrakuService = () => ({
	policy<xMeta, xAuth>(p: RenrakuPolicy<xMeta, xAuth>) {
		return {
			expose<xMethods extends Methods>(e: Expose<xAuth, xMethods>): RenrakuService<xMeta, xAuth, xMethods> {
				return {
					[is_renraku_service]: is_renraku_service,
					expose: e,
					policy: p,
				}
			},
		}
	},
})

export function renrakuApi<xApi extends RenrakuApi>(api: xApi): xApi {
	return api
}
