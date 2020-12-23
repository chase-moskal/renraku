
import {Topic} from "../types/primitive/topic.js"

export function asTopic<xMeta, xTopic extends Topic<xMeta>>(topic: xTopic) {
	return topic
}
