
import {objectMap} from "./tools/object-map.js"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = Record<string, Fn>

export type AuthFn<A> = (a: A, ...p: any[]) => Promise<any>
export type AuthFns<A> = Record<string, AuthFn<A>>

export type FirstParams<F extends Fn> = F extends (first: infer First, ...a: any[]) => Promise<any>
	? First
	: never
export type OtherParams<F extends Fn> = F extends (first: any, ...a: infer Others) => Promise<any>
	? Others
	: never

export function service<A, Fs extends Fns>(s: (auth: A) => Fs) {
	const target: any = {}
	return new Proxy(target, {
		get: (_, key: string) => {
			return target[key] ?? (
				(auth: A, ...params: any[]) => s(auth)[key](...params)
			)
		},
		set: (_, key: string, value: any) => {
			target[key] = value
			return true
		},
	}) as {
		[K in keyof Fs]: (auth: A, ...params: Parameters<Fs[K]>) => ReturnType<Fs[K]>
	}
}

export function authenticate<A, Fs extends AuthFns<A>>(auth: A, fns: Fs) {
	return objectMap(fns, fn => {
		return async(...p: any[]) => {
			fn(auth, ...p)
		}
	}) as {
		[K in keyof Fs]: (...p: OtherParams<Fs[K]>) => ReturnType<Fs[K]>
	}
}

export const myService = service((auth: string) => ({
	async sum(a: number, b: number) {
		console.log(auth)
		return a + b
	},
}))

const authed = authenticate("hello", myService)

const r1 = await myService.sum("hello", 1, 2)
const r2 = await authed.sum(1, 2)

