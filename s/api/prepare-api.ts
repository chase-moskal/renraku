
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {isFunction} from "../identities/is-function.js"

import {Topic} from "../types/primitives/topic.js"
import {Comms} from "../types/primitives/comms.js"
import {Policy} from "../types/primitives/policy.js"
import {ApiContext} from "../types/api/api-context.js"
import {ButteredProcedure} from "../types/api/buttered-procedure.js"
import { _butter } from "../types/symbols/butter-symbol.js"
import { _context } from "../types/symbols/context-symbol.js"

export function prepareApi<xRequest, xResponse>(comms: Comms<xRequest, xResponse>) {
	return function <xAuth, xMeta>() {
		return function recurse<xPolicy extends Policy<xAuth, xMeta>, xTopic extends Topic<xMeta>>(
				policy: xPolicy,
				topic: xTopic
			): ApiContext<xAuth, xMeta, xTopic, xPolicy> {
			return objectMap(topic, (value, key) => {
				if (isFunction(value))
					return <ButteredProcedure<xAuth, xMeta, any, any, xPolicy>>{
						[_butter]: true,
						policy,
						func: value,
					}
				else if (isObject(value))
					return <ApiContext<xAuth, xMeta, xTopic, xPolicy>>{
						[_context]: true,
						...recurse(policy, value)
					}
				else
					throw new Error(`unknown value for "${key}"`)
			})
		}
	}
}