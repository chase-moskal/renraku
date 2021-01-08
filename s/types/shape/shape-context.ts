
import { _gravy } from "../symbols/gravy-symbol"
import { Gravy } from "../remote/gravy"

export interface ShapeContext<xAuth> {
	[_gravy]: Gravy<xAuth>
	[key: string]: true | ShapeContext<xAuth>
}
