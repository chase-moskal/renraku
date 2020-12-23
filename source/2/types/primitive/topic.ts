
import {Procedure} from "./procedure.js"

export type Topic<xMeta> = {
	[key: string]: Topic<xMeta> | Procedure<xMeta, any[], any>
}
