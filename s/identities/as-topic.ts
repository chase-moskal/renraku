
import {Topic} from "../types/primitives/topic.js"

export function asTopic<xAuth>() {
	return function<xTopic extends Topic<xAuth>>(topic: xTopic) {
		return topic
	}
}
