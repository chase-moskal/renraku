
import { ButteredProcedure } from "./buttered-procedure"

export type OnlyButteredProcedures<T> = {
	[P in keyof T as T[P] extends ButteredProcedure<any, any, any[], any, any> ? P : never]: T[P]
}
