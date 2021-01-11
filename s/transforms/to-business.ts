
import {objectMap} from "../tools/object-map.js"
import {isObject} from "../identities/is-object.js"
import {isFunction} from "../identities/is-function.js"

import {Topic} from "../types/primitives/topic.js"
import {Business} from "../types/primitives/business.js"
import {_augment} from "../types/symbols/augment-symbol.js"

export function toBusiness<xAuth>() {
	return function recurse<xTopic extends Topic<xAuth>>({topic, getAuth}: {
			topic: xTopic
			getAuth: () => Promise<xAuth>
		}): Business<xTopic> {

		return objectMap(topic, (value, key) => {
			if (isFunction(value))
				return async(...args: any[]) => value(await getAuth(), ...args)
			else if (isObject(value))
				return recurse({topic: value, getAuth})
			else
				throw new Error(`unknown topic subtype for "${key}"`)
		})
	}
}
