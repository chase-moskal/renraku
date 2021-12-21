
import {ApiError} from "./error.js"
import {obtain} from "./tools/obtain.js"
import {Api, Methods, Request, Servelet, Service} from "./types.js"

export function servelet(api: Api): Servelet {
	return async function execute(request: Request) {
		const servicePath = request.method.slice(1).split(".")
		const methodName = servicePath.pop()
		const service: Service<any, any, Methods> = obtain(servicePath.join("."), api)
		if (!service)
			throw new ApiError(400, `renraku service not found "${servicePath}"`)
		const auth = await service.policy(request.meta)
		const methods = service.expose(auth)
		const executor = methods[methodName]
		if (!executor)
			throw new ApiError(400, `renraku method "${methodName}" not found on service "${servicePath}"`)
		return executor(...request.params)
	}
}
