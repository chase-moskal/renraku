
export function obtain<xResult>(
		path: string[],
		object: {[key: string]: any},
	): xResult {

	return path.reduce(
		(x, y) => x && x[y] || undefined,
		object,
	)
}
