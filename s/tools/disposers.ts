
export function disposers(...fns: (() => void)[]) {
	return () => fns.forEach(fn => fn())
}

