
import {Gravy} from "../remote/gravy.js"
import {ToApiContext} from "../api/to-api-context.js"
import {ApiGroupings} from "../api/api-groupings.js"
import {_gravy} from "../symbols/gravy-symbol.js"
import {_context} from "../symbols/context-symbol.js"
import {ProcedureDescriptor} from "../api/procedure-descriptor.js"
import {OnlyProcedureDescriptors} from "../api/only-procedure-descriptors.js"

export type ToShape<xGroupings extends ApiGroupings> = {
	[P in keyof xGroupings]: xGroupings[P] extends ProcedureDescriptor<any, any, any[], any, any>
		? true
		: xGroupings[P] extends ApiGroupings
			? xGroupings[P] extends ToApiContext<any, any, any, any>
				? {
					[_gravy]: Gravy<xGroupings[P][typeof _context]["auth"]>
				} & {
					[P2 in keyof OnlyProcedureDescriptors<xGroupings[P]>]: true
				}
				: ToShape<xGroupings[P]>
			: never
}
