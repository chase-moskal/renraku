
import {Topic} from "./topic.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "./procedure.js"

export type ToRemote<xTopic extends Topic<any>> = {
	[P in keyof xTopic]: xTopic[P] extends Topic<any>
		? ToRemote<xTopic[P]>
		: xTopic[P] extends Procedure<any, any[], any>
			? (...args: DropFirst<Parameters<xTopic[P]>>) => ReturnType<xTopic[P]>
			: never
}
