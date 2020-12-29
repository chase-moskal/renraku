
import {Topic} from "../types/primitives/topic.js"

export function asTopic<xMeta>() {
	return function<xTopic extends Topic<xMeta>>(topic: xTopic) {
		return topic
	}
}
