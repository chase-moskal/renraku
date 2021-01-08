
export function isApiError(error: Error) {
	return typeof error === "number"
}
