
import {ProcedureDescriptor} from "./procedure-descriptor.js"

export type OnlyProcedureDescriptors<T> = {
	[P in keyof T as T[P] extends ProcedureDescriptor<any, any, any[], any, any> ? P : never]: T[P]
}
