
import {Api} from "../types/api/api.js"
import {ToShape} from "../types/remote/to-shape.js"

export function asShape<xApi extends Api>(
		shape: ToShape<xApi>
	) {

	return shape
}
