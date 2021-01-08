
import {isObject} from "./is-object.js"

export function isApiError(error: Error) {
	const err: any = error
	return isObject(err) && typeof err.code === "number"
}
