
import {Procedure} from "./procedure.js"

export type Topic<xAuth> = {
	[key: string]: Topic<xAuth> | Procedure<xAuth, any[], any>
}
