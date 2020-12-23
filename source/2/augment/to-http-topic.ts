
import {objectMap} from "../tool/object-map.js"
import {Topic} from "../types/primitive/topic.js"
import {Method} from "../types/primitive/method.js"
import {HttpMethod} from "../types/http/http-method.js"
import {ToHttpTopic} from "../types/transform/to-http-topic.js"

export function toHttpTopic<xAuth, xMeta>() {
	return function<xTopic extends Topic<xMeta>>(
			augmentor: (method: Method<xMeta, any[], any>) => HttpMethod<xAuth>,
			topic: xTopic,
		): ToHttpTopic<xAuth, xTopic> {

		return objectMap(topic, (value, key) => {
			if (typeof value === "function") {
				const method: Method<xMeta, any[], any> = value
				return augmentor(method)
			}
			else if (!!value && typeof value === "object") {
				const subTopic: Topic<xMeta> = value
				return toHttpTopic()(augmentor, subTopic)
			}
			else {
				throw new Error(`invalid topic value, "${key}"`)
			}
		})
	}
}
