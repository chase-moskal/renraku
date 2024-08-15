
import {AuthFns, AuthUnwrap} from "./types.js"

export function provideAuth<A, S extends AuthFns<A>>(auth: A, service: S) {
	return new Proxy({}, {
		get: (target: any, key: string) => {
			return target[key] ?? (
				async(...p: any[]) => await service[key](auth, ...p)
			)
		},
		set: (target: any, key: string, value: any) => {
			target[key] = value
			return true
		},
	}) as AuthUnwrap<S>
}

