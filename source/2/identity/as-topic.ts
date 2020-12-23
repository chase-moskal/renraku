
import {Topic} from "../types/primitive/topic.js"

export function asTopic<xMeta>() {
	return function<xTopic extends Topic<xMeta>>(topic: xTopic) {
		return topic
	}
}
