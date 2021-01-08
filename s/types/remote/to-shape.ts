
import {Augment} from "./augment.js"
import {ToApiContext} from "../api/to-api-context.js"
import {ApiGroup} from "../api/api-group.js"
import {_augment} from "../symbols/augment-symbol.js"
import {_context} from "../symbols/context-symbol.js"
import {ProcedureDescriptor} from "../api/procedure-descriptor.js"
import {OnlyProcedureDescriptors} from "../api/only-procedure-descriptors.js"

export type ToShape<xApiGroup extends ApiGroup> = {
	[P in keyof xApiGroup]: xApiGroup[P] extends ProcedureDescriptor<any, any, any[], any, any>
		? true
		: xApiGroup[P] extends ApiGroup
			? xApiGroup[P] extends ToApiContext<any, any, any, any>
				? {
					[_augment]: Augment<xApiGroup[P][typeof _context]["auth"]>
				} & {
					[P2 in keyof OnlyProcedureDescriptors<xApiGroup[P]>]: true
				}
				: ToShape<xApiGroup[P]>
			: never
}
