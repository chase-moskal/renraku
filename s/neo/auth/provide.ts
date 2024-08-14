
import {AuthFns, AuthUnwrap} from "./types.js"

export function provideAuth<A, Fs extends AuthFns<A>>(auth: A, fns: Fs) {
	return new Proxy({}, {
		get: (target: any, key: string) => {
			return target[key] ?? (
				async(...p: any[]) => await fns[key](auth, ...p)
			)
		},
		set: (target: any, key: string, value: any) => {
			target[key] = value
			return true
		},
	}) as AuthUnwrap<Fs>
}

