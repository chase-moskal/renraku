
import {ApiError} from "../api/api-error.js"

export function isApiError(error: any) {
	return !!error && error instanceof ApiError
}
