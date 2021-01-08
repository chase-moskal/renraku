
import {DropFirst} from "../tools/drop-first.js"
import {ApiGroupings} from "../api/api-groupings.js"
import {ButteredProcedure} from "../api/buttered-procedure.js"

export type ToRemote<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ButteredProcedure<any, any, any[], any, any>
		? (...args: DropFirst<Parameters<xGroupings[P]["func"]>>) => ReturnType<xGroupings[P]["func"]>
		: xGroupings[P] extends ApiGroupings
			? ToRemote<xGroupings[P]>
			: never
}
