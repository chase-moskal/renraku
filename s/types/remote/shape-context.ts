
import {Gravy} from "../remote/gravy.js"
import {_gravy} from "../symbols/gravy-symbol.js"

export interface ShapeContext<xAuth> {
	[_gravy]: Gravy<xAuth>
	[key: string]: true | ShapeContext<xAuth>
}
