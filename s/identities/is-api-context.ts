
import {isObject} from "./is-object.js"

import {_augment} from "../types/symbols/augment-symbol.js"
import {_context} from "../types/symbols/context-symbol.js"

export function isApiContext(apiContext: any) {
	return isObject(apiContext) && !!apiContext[_context]
}
