
import {Augment} from "./augment.js"
import {_meta} from "../symbols/meta-symbol.js"

export interface ShapeContext<xMeta> {
	[_meta]: Augment<xMeta>
	[key: string]: true | ShapeContext<xMeta>
}
