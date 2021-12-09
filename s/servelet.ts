
import {obtain} from "./tools/obtain.js"
import {Api, Methods, RenrakuRequest, Service} from "./types.js"

export function renrakuServelet(api: Api) {
	return async function servelet(request: RenrakuRequest) {
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
}
