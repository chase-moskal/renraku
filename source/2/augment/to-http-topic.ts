
import {objectMap} from "../tool/object-map.js"
import {Topic} from "../types/primitive/topic.js"
import {Procedure} from "../types/primitive/procedure.js"
import {ToHttpTopic} from "../types/augment/to-http-topic.js"
import {HttpProcedure} from "../types/http/http-procedure.js"

export function toHttpTopic<xAuth, xMeta>() {
	return function<xTopic extends Topic<xMeta>>({topic, augmentor}: {
			topic: xTopic,
			augmentor: (method: Procedure<xMeta, any[], any>) => HttpProcedure<xAuth>,
		}): ToHttpTopic<xAuth, xTopic> {

		return objectMap(topic, (value, key) => {
			if (typeof value === "function") {
				const method: Procedure<xMeta, any[], any> = value
				return augmentor(method)
			}
			else if (!!value && typeof value === "object") {
				const subTopic: Topic<xMeta> = value
				return toHttpTopic()({augmentor, topic: subTopic})
			}
			else {
				throw new Error(`invalid topic value, "${key}"`)
			}
		})
	}
}
