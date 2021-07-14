
import {isObject} from "./is-object.js"

import {_meta} from "../types/symbols/meta-symbol.js"
import {_context} from "../types/symbols/context-symbol.js"

export function isApiContext(apiContext: any) {
	return isObject(apiContext) && !!apiContext[_context]
}
