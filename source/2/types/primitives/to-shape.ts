
import {Topic} from "./topic.js"
import {Procedure} from "./procedure.js"

export type ToShape<xTopic extends Topic<any>> = {
	[P in keyof xTopic]: xTopic[P] extends Topic<any>
		? ToShape<xTopic[P]>
		: xTopic[P] extends Procedure<any, any[], any>
			? true
			: never
}
