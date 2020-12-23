
import {Method} from "./method.js"

export type Topic<xMeta> = {
	[key: string]: Topic<xMeta> | Method<xMeta, any[], any>
}
