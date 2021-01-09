
import {ApiGroup} from "../types/api/api-group.js"

export function asApiGroup<xApiGroup extends ApiGroup>(api: xApiGroup) {
	return api
}
