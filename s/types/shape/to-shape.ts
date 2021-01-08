
import { ButteredProcedure } from "../api/buttered-procedure"
import { ApiContext } from "../api/api-context"
import { ApiGroupings } from "../api/api-groupings"
import { Gravy } from "../remote/gravy"
import { OnlyButteredProcedures } from "../api/only-buttered-procedures"
import { _gravy } from "../symbols/gravy-symbol"
import { _context } from "../symbols/context-symbol"

export type ToShape<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ButteredProcedure<any, any, any[], any, any> ? true : xGroupings[P] extends ApiGroupings ? xGroupings[P] extends ApiContext<any, any, any, any> ? {
		[_gravy]: Gravy<xGroupings[P][typeof _context]["auth"]>
	} & {
		[P2 in keyof OnlyButteredProcedures<xGroupings[P]>]: true
	} : ToShape<xGroupings[P]> : never
}
