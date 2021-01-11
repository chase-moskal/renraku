
import {Topic} from "../primitives/topic.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "../primitives/procedure.js"
import {_context} from "../symbols/context-symbol.js"

export type CurryTopic<xAuth, xTopic extends Topic<xAuth>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<any, any[], any>
		? (...args: DropFirst<Parameters<xTopic[P]>>) => ReturnType<xTopic[P]>
		: xTopic[P] extends Topic<any>
			? CurryTopic<xAuth, xTopic[P]>
			: never
}
