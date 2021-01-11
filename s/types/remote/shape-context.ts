
import {Augment} from "./augment.js"
import {_augment} from "../symbols/augment-symbol.js"

export interface ShapeContext<xMeta> {
	[_augment]: Augment<xMeta>
	[key: string]: true | ShapeContext<xMeta>
}
