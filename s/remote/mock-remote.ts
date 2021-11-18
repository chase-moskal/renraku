
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

	type xMeta = xApiContext[typeof _context]["meta"]
	type xAuth = xApiContext[typeof _context]["auth"]

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
		withMeta<xRequest>({meta, request}: {
				meta: xMeta
				request: xRequest
			}) {
			return prepareRoutine(
				async procedure => procedure.policy(meta, request)
			)
		},
		forceAuth(auth: xAuth) {
			return prepareRoutine(async() => auth)
		},
	}
}
