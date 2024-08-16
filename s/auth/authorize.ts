
import {AuthFns, AuthUnwrap} from "./types.js"

export function authorize<A, S extends AuthFns<A>>(
		service: S,
		getAuth: () => Promise<A>,
	) {

	return new Proxy({}, {

		get: (target: any, key: string) => {
			return target[key] ?? (
				async(...p: any[]) => await service[key](await getAuth(), ...p)
			)
		},

		set: (target: any, key: string, value: any) => {
			target[key] = value
			return true
		},
	}) as AuthUnwrap<S>
}

