
import {AuthWrap} from "./types.js"
import {Fns} from "../core/types.js"

export function requireAuth<A, Fs extends Fns>(s: (auth: A) => Promise<Fs>) {
	const target: any = {}
	return new Proxy(target, {

		get: (_, key: string) => {
			return target[key] ?? (
				async(auth: A, ...params: any[]) => (await s(auth))[key](...params)
			)
		},

		set: (_, key: string, value: any) => {
			target[key] = value
			return true
		},

	}) as AuthWrap<A, Fs>
}

