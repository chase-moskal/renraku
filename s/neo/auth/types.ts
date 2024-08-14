
import {Fn, Fns} from "../core/types.js"

export type AuthFn<A> = (a: A, ...p: any[]) => Promise<any>
export type AuthFns<A> = Record<string, AuthFn<A>>

export type FirstParams<F extends Fn> = (
	F extends ((first: infer First, ...a: any[]) => Promise<any>)
		? First
		: never
)

export type OtherParams<F extends Fn> = (
	F extends ((first: any, ...a: infer Others) => Promise<any>)
		? Others
		: never
)

export type AuthWrap<A, Fs extends Fns> = {
	[K in keyof Fs]:
		(auth: A, ...params: Parameters<Fs[K]>) => ReturnType<Fs[K]>
}

export type AuthUnwrap<Fs extends Fns> = {
	[K in keyof Fs]:
		(...p: OtherParams<Fs[K]>) => ReturnType<Fs[K]>
}

