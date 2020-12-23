
import {Topic} from "../primitive/topic.js"
import {Method} from "../primitive/method.js"
import {ToHttpMethod} from "./to-http-method.js"

export type ToHttpTopic<xAuth extends any, xTopic extends Topic<any>> = {
	[P in keyof xTopic]: xTopic[P] extends Topic<any>
		? ToHttpTopic<xAuth, xTopic[P]>
		: xTopic[P] extends Method<any, any[], any>
			? ToHttpMethod<xAuth, xTopic[P]>
			: never
}
