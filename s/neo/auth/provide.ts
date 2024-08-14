
import {AuthFns, AuthUnwrap} from "./types.js"
import {objectMap} from "../../tools/object-map.js"

export function provideAuth<A, Fs extends AuthFns<A>>(auth: A, fns: Fs) {
	return objectMap(
		fns,
		fn => async(...p: any[]) => fn(auth, ...p),
	) as AuthUnwrap<Fs>
}

