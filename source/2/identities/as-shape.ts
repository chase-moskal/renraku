
import {ToShape} from "../types/primitives/to-shape.js"
import {Topic} from "../types/primitives/topic.js"

export function asShape<xTopic extends Topic<any>>(shape: ToShape<xTopic>) {
	return shape
}
