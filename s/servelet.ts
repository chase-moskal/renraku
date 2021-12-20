
import {RenrakuError} from "./error.js"
import {obtain} from "./tools/obtain.js"
import {RenrakuApi, Methods, RenrakuRequest, RenrakuService} from "./types.js"

export function renrakuServelet(api: RenrakuApi) {
	return async function servelet(request: RenrakuRequest) {
		const servicePath = request.method.slice(1).split(".")
		const methodName = servicePath.pop()
		const service: RenrakuService<any, any, Methods> = obtain(servicePath.join("."), api)
		if (!service)
			throw new RenrakuError(400, `renraku service not found "${servicePath}"`)
		const auth = await service.policy(request.meta)
		const methods = service.expose(auth)
		const executor = methods[methodName]
		if (!executor)
			throw new RenrakuError(400, `renraku method "${methodName}" not found on service "${servicePath}"`)
		return executor(...request.params)
	}
}
