
import {isObject} from "./is-object.js"
import {gravySymbol} from "../types/symbols/gravy-symbol.js"
import {ShapeContext} from "../types/shape/shape-context.js"

export function isShapeContext(shapeContext: ShapeContext<any>) {
	return isObject(shapeContext) && !!shapeContext[gravySymbol]
}
