
import {Remote} from "../types/remote/remote.js"
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {ApiContext} from "../types/api/api-context.js"
import {_context} from "../types/symbols/context-symbol.js"
import {_descriptor} from "../types/symbols/descriptor-symbol.js"
import {ProcedureDescriptor} from "../types/api/procedure-descriptor.js"

export function mockRemote<
		xApiContext extends ApiContext<any, any, any, any>
	>(apiContext: xApiContext) {
	
	type xMeta = xApiContext extends ApiContext<infer zMeta, any, any, any>
		? zMeta
		: never
	
	type xAuth = xApiContext extends ApiContext<any, infer zAuth, any, any>
		? zAuth
		: never

	type xProcedure = ProcedureDescriptor<xMeta, xAuth, any, any, any>

	function prepareRoutine(routine: (procedure: xProcedure) => Promise<xAuth>) {
		function recurse(context: ApiContext<any, any, any, any>): Remote<xApiContext> {
			return objectMap(context, value => {
				if (value[_descriptor])
					return async(...args: any[]) => {
						const procedure: xProcedure = value
						const auth = await routine(procedure)
						return procedure.func(auth, ...args)
					}
				else if (isObject(value))
					return recurse(value)
				else
					throw new Error("invalid api context for mock remote")
			})
		}
		return recurse(apiContext)
	}

	return {
		withMeta<xRequest>(meta: xMeta, request?: xRequest) {
			return prepareRoutine(async procedure => procedure.policy(meta, request))
		},
		forceAuth(auth: xAuth) {
			return prepareRoutine(async() => auth)
		},
	}
}

// export function mockRemote<xApiContext extends ApiContext<any, any, any, any>>(apiContext: xApiContext) {
// 	return function(
// 			getMockAuth: xApiContext extends ApiContext<any, infer xAuth, any, any>
// 				? (() => Promise<xAuth>)
// 				: never
// 		): Remote<xApiContext> {
// 		function recurse(context: ApiContext<any, any, any, any>): any {
// 			return objectMap(context, value => {
// 				if (value[_descriptor])
// 					return async(...args: any[]) => {
// 						const auth = await getMockAuth()
// 						const procedure: ProcedureDescriptor<any, any, any, any, any> = value
// 						return procedure.func(auth, ...args)
// 					}
// 				else if (value[_context])
// 					return recurse(value)
// 				else
// 					throw new Error("error mocking api context")
// 			})
// 		}
// 		return recurse(apiContext)
// 	}
// }
