
// import {objectMap} from "../tools/object-map.js"
// import {Topic} from "../types/primitives/topic.js"
// import {Procedure} from "../types/primitives/procedure.js"
// import {HttpProcedure} from "../types/http/http-procedure.js"
// import {ToHttpTopic} from "../types/augmentations/to-http-topic.js"

// export function toHttpTopic<xAuth, xMeta>() {
// 	return function<xTopic extends Topic<xMeta>>({topic, augmentor}: {
// 			topic: xTopic,
// 			augmentor: (method: Procedure<xMeta, any[], any>) => Promise<HttpProcedure<xAuth>>,
// 		}): ToHttpTopic<xAuth, xTopic> {

// 		return objectMap(topic, (value, key) => {
// 			if (typeof value === "function") {
// 				const method: Procedure<xMeta, any[], any> = value
// 				return augmentor(method)
// 			}
// 			else if (!!value && typeof value === "object") {
// 				const subTopic: Topic<xMeta> = value
// 				return toHttpTopic()({augmentor, topic: subTopic})
// 			}
// 			else {
// 				throw new Error(`invalid topic value, "${key}"`)
// 			}
// 		})
// 	}
// }
