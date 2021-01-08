
import {Gravy} from "../remote/gravy.js"
import {ToApiContext} from "../api/to-api-context.js"
import {ApiGroupings} from "../api/api-groupings.js"
import {gravySymbol} from "../symbols/gravy-symbol.js"
import {contextSymbol} from "../symbols/context-symbol.js"
import {ButteredProcedure} from "../api/buttered-procedure.js"
import {OnlyButteredProcedures} from "../api/only-buttered-procedures.js"

export type ToShape<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ButteredProcedure<any, any, any[], any, any>
		? true
		: xGroupings[P] extends ApiGroupings
			? xGroupings[P] extends ToApiContext<any, any, any, any>
				? {
					[gravySymbol]: Gravy<xGroupings[P][typeof contextSymbol]["auth"]>
				} & {
					[P2 in keyof OnlyButteredProcedures<xGroupings[P]>]: true
				}
				: ToShape<xGroupings[P]>
			: never
}
