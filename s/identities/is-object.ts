
export function isObject(value: any) {
	return value !== undefined
		&& value !== null
		&& typeof value === "object"
}
