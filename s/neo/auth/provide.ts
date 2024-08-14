
import {AuthFns, AuthUnwrap} from "./types.js"

export function provideAuth<A, Fs extends AuthFns<A>>(auth: A, fns: Fs) {
	return new Proxy({}, {
		get: (_, key: string) => async(...p: any[]) => await fns[key](auth, ...p),
		set: () => { throw new Error("readonly") },
	}) as AuthUnwrap<Fs>
}

