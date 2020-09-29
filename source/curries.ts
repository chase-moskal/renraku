
import {Topic, Api} from "./interfaces.js"
import {objectMap} from "./internals/object-map.js"

// meta-as-option curries
//

export function curryTopicMetaOption<T extends Topic, Meta>(
		topic: T,
		getMeta: () => Promise<Meta>,
	): CurryMetaTopic<T> {
	return objectMap<T, CurryMetaTopic<T>>(
		topic,
		method => curryMethodMetaOption(method, getMeta),
	)
}

export function curryApiMetaOption<A extends Api, Meta>(
		api: A,
		getMeta: () => Promise<Meta>
	): CurryMetaApi<A> {
	return objectMap<A, CurryMetaApi<A>>(
		api,
		topic => curryTopicMetaOption(topic, getMeta)
	)
}

// meta-as-first-argument curries
//

export function curryTopicMetaArg<T extends Topic, Meta>(
		topic: T,
		getMeta: () => Promise<Meta>,
	): CurriedTopicMetaArg<T> {
	return objectMap<T, CurriedTopicMetaArg<T>>(
		topic,
		method => curryMethodMetaArg(method, getMeta),
	)
}

export function curryApiMetaArg<A extends Api, Meta>(
	api: A,
	getMeta: () => Promise<Meta>
): CurriedApiMetaArg<A> {
return objectMap<A, CurriedApiMetaArg<A>>(
	api,
	topic => curryTopicMetaArg(topic, getMeta)
)
}

// fancy types
//

type Shift<T extends any[]> =
	T["length"] extends 0 ? undefined :
	(((...b: T) => void) extends (a: any, ...b: infer I) => void ? I : [])

type CurryMetaTopic<T extends Topic> = {
	[P in keyof T]: (
		options: Omit<Parameters<T[P]>[0], "meta">,
		...args: Shift<Parameters<T[P]>>
	) => ReturnType<T[P]>
}

type CurryMetaApi<A extends Api> = {
	[P in keyof A]: CurryMetaTopic<A[P]>
}

type CurriedTopicMetaArg<T extends Topic> = {
	[P in keyof T]: (...args: Shift<Parameters<T[P]>>) => ReturnType<T[P]>
}

type CurriedApiMetaArg<A extends Api> = {
	[P in keyof A]: CurriedTopicMetaArg<A[P]>
}

// method curries
//

function curryMethodMetaOption<Meta, Options extends {}, Args extends any[], Ret>(
		method: (options: Options & {meta: Meta}, ...args: Args) => Promise<Ret>,
		getMeta: () => Promise<Meta>,
	) {
	return async(options: Omit<Options, "meta">, ...args: Args) => method({
		...(<Options>options),
		meta: await getMeta(),
	}, ...args)
}

function curryMethodMetaArg<Meta, Args extends any[], Ret>(
		method: (meta: Meta, ...args: Args) => Promise<Ret>,
		getMeta: () => Promise<Meta>,
	) {
	return async(...args: Args) => method(await getMeta(), ...args)
}

// // hypothetical augmentations
// //

// function augmentMethodMetaOptionTransform<Meta, Transform, Options extends {}, Args extends any[], Ret>(
// 		method: (options: Options & {transform: Transform}, ...args: Args) => Promise<Ret>,
// 		getTransform: (meta: Meta) => Promise<Transform>,
// 	) {
// 	return async(options: Omit<Options, "transform"> & {meta: Meta}, ...args: Args) => method({
// 		...(<any>options),
// 		transform: await getTransform(options.meta),
// 	}, ...args)
// }
