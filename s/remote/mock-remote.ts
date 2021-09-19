
import {Remote} from "../types/remote/remote.js"
import {objectMap} from "../tools/object-map.js"
import {ApiContext} from "../types/api/api-context.js"
import {_context} from "../types/symbols/context-symbol.js"
import {_descriptor} from "../types/symbols/descriptor-symbol.js"
import {ProcedureDescriptor} from "../types/api/procedure-descriptor.js"

export function mockRemote<xApiContext extends ApiContext<any, any, any, any>>(apiContext: xApiContext) {
	return function(
			getMockAuth: xApiContext extends ApiContext<any, infer xAuth, any, any>
				? (() => Promise<xAuth>)
				: never
		): Remote<xApiContext> {
		function recurse(context: ApiContext<any, any, any, any>): any {
			return objectMap(context, value => {
				if (value[_descriptor])
					return async(...args: any[]) => {
						const auth = await getMockAuth()
						const procedure: ProcedureDescriptor<any, any, any, any, any> = value
						return procedure.func(auth, ...args)
					}
				else if (value[_context])
					return recurse(value)
				else
					throw new Error("error mocking api context")
			})
		}
		return recurse(apiContext)
	}
}
