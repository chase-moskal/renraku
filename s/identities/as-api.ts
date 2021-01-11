
import {Api} from "../types/api/api.js"

export function asApi<xApi extends Api>(api: xApi) {
	return api
}
