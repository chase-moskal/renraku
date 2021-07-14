
import {Augment} from "./augment.js"
import {ToApiContext} from "../api/to-api-context.js"
import {Api} from "../api/api.js"
import {_meta} from "../symbols/meta-symbol.js"
import {_context} from "../symbols/context-symbol.js"
import {ProcedureDescriptor} from "../api/procedure-descriptor.js"
import {OnlyProcedureDescriptors} from "../api/only-procedure-descriptors.js"

export type ToShape<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends ProcedureDescriptor<any, any, any[], any, any>
		? true
		: xApi[P] extends Api
			? xApi[P] extends ToApiContext<any, any, any, any>
				? {
					[_meta]: Augment<xApi[P][typeof _context]["meta"]>
				} & {
					[P2 in keyof OnlyProcedureDescriptors<xApi[P]>]: true
				}
				: ToShape<xApi[P]>
			: never
}
