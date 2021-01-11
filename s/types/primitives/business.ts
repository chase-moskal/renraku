
import {Topic} from "./topic.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "./procedure.js"
import {_context} from "../symbols/context-symbol.js"

export type Business<xTopic extends Topic<any>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<any, any[], any>
		? (...args: DropFirst<Parameters<xTopic[P]>>) => ReturnType<xTopic[P]>
		: xTopic[P] extends Topic<any>
			? Business<xTopic[P]>
			: never
}
