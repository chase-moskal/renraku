
export function isVoid(x: any | undefined | null): x is undefined | null {
	return x === undefined || x === null
}

