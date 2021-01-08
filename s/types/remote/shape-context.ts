
import {Augment} from "./augment.js"
import {_augment} from "../symbols/augment-symbol.js"

export interface ShapeContext<xAuth> {
	[_augment]: Augment<xAuth>
	[key: string]: true | ShapeContext<xAuth>
}
