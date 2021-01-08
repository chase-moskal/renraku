
import {ToShape} from "../types/remote/to-shape.js"
import {ApiGroupings} from "../types/api/api-groupings.js"

export function asShape<xGroupings extends ApiGroupings>(
		shape: ToShape<xGroupings>
	) {

	return shape
}
