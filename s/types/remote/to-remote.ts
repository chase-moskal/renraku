
import {DropFirst} from "../tools/drop-first.js"
import {ApiGroup} from "../api/api-group.js"
import {ProcedureDescriptor} from "../api/procedure-descriptor.js"

export type ToRemote<xApiGroup extends ApiGroup> = {
	[P in keyof xApiGroup]: xApiGroup[P] extends ProcedureDescriptor<any, any, any[], any, any>
		? (...args: DropFirst<Parameters<xApiGroup[P]["func"]>>) => ReturnType<xApiGroup[P]["func"]>
		: xApiGroup[P] extends ApiGroup
			? ToRemote<xApiGroup[P]>
			: never
}
