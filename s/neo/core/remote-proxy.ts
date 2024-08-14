
import {NestedFns} from "./types.js"

export function remoteProxy<N extends NestedFns>(
		executor: (path: string[], args: any[]) => Promise<any>
	) {

	function recurse(path: string[]) {
		return new Proxy((() => {}) as any, {
			apply: (_, _this, args) => executor(path, args),
			get: (target, key: string) => {
				return target[key] ?? recurse([...path, key])
			},
			set: (target, key: string, value: any) => {
				target[key] = value
				return true
			},
		})
	}

	return recurse([]) as N
}

