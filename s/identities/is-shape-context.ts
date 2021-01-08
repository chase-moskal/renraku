import { isObject } from "./is-object"
import { ShapeContext } from "../types/shape/shape-context"
import { _gravy } from "../types/symbols/gravy-symbol"


export function isShapeContext(shapeContext: ShapeContext<any>) {
	return isObject(shapeContext) && !!shapeContext[_gravy]
}
