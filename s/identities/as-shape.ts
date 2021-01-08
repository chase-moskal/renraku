
import {ToShape} from "../types/remote/to-shape.js"
import {ApiGroup} from "../types/api/api-group.js"

export function asShape<xApiGroup extends ApiGroup>(
		shape: ToShape<xApiGroup>
	) {

	return shape
}
