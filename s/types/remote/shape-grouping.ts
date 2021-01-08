
import {ShapeContext} from "./shape-context.js"

export type ShapeGrouping<xAuth> = {
	[key: string]: ShapeContext<xAuth>
}
