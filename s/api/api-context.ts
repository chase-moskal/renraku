
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {isFunction} from "../identities/is-function.js"

import {Topic} from "../types/primitives/topic.js"
import {Policy} from "../types/primitives/policy.js"
import {_context} from "../types/symbols/context-symbol.js"
import {ToApiContext} from "../types/api/to-api-context.js"
import {_descriptor} from "../types/symbols/descriptor-symbol.js"
import {ProcedureDescriptor} from "../types/api/procedure-descriptor.js"

export function apiContext<xAuth, xMeta>() {
	return function recurse<
			xPolicy extends Policy<xAuth, xMeta>,
			xTopic extends Topic<xMeta>,
		>({expose, policy}: {
			expose: xTopic
			policy: xPolicy
		}): ToApiContext<xAuth, xMeta, xTopic, xPolicy> {

		return objectMap(expose, (value, key) => {
			if (isFunction(value))
				return <ProcedureDescriptor<xAuth, xMeta, any, any, xPolicy>>{
					[_descriptor]: true,
					policy,
					func: value,
				}
			else if (isObject(value))
				return <ToApiContext<xAuth, xMeta, xTopic, xPolicy>>{
					[_context]: true,
					...recurse({policy, expose: value})
				}
			else
				throw new Error(`unknown value for "${key}"`)
		})
	}
}
