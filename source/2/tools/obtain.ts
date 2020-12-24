
export function obtain<xResult>(
		specifier: string,
		object: {[key: string]: any},
	): xResult {

	return specifier.split(".").reduce(
		(x, y) => x && x[y] || undefined,
		object,
	)
}
