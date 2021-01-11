
import {Api} from "../api/api.js"
import {DropFirst} from "../tools/drop-first.js"
import {ProcedureDescriptor} from "../api/procedure-descriptor.js"

export type ToRemote<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends ProcedureDescriptor<any, any, any[], any, any>
		? (...args: DropFirst<Parameters<xApi[P]["func"]>>) => ReturnType<xApi[P]["func"]>
		: xApi[P] extends Api
			? ToRemote<xApi[P]>
			: never
}
