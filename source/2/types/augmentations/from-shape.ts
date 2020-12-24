
import {Topic} from "../primitives/topic.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "../primitives/procedure.js"
import { Shape } from "../primitives/shape.js"

export type FromShape<xMeta, xTopic extends Topic<xMeta>> = {
	[P in keyof xTopic]: xTopic[P] extends Topic<any>
		? FromShape<xMeta, xTopic[P]>
		: xTopic[P] extends Procedure<any, any[], any>
			? Procedure<xMeta, DropFirst<Parameters<xTopic[P]>>, ReturnType<xTopic[P]>>
			: never
}
