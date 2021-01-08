
import {isObject} from "./is-object.js"

import {_augment} from "../types/symbols/augment-symbol.js"
import {ShapeContext} from "../types/remote/shape-context.js"

export function isShapeContext(shapeContext: ShapeContext<any>) {
	return isObject(shapeContext) && !!shapeContext[_augment]
}
