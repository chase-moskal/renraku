
import {ApiError} from "../../api/api-error"

export interface ServeletLogger {
	logRequest({}: {
		specifier: string
		meta: any
		args: any
		result: any
		times: {
			total: number
			auth: number
			procedure: number
		}
	}): void
	logApiError(error: ApiError): void
	logUnexpectedError(error: any): void
}
