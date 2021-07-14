
import {Api} from "../types/api/api.js"
import {Shape} from "../types/remote/shape.js"

export function asShape<xApi extends Api>(
		shape: Shape<xApi>
	) {

	return shape
}
