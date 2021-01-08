
import {Gravy} from "../remote/gravy.js"
import {gravySymbol} from "../symbols/gravy-symbol.js"

export interface ShapeContext<xAuth> {
	[gravySymbol]: Gravy<xAuth>
	[key: string]: true | ShapeContext<xAuth>
}
