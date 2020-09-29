
// import {Topic, Method} from "../interfaces.js"
import {objectMap2, objectMap1, objectMap3} from "./object-map.js"

//
// MAD SCIENCE
//

export type Method = (...args: any[]) => Promise<any>

export type Topic = {
	[key: string]: Method
}

export type Api = {
	[key: string]: Topic
}



function curryMethodMetaArg<Meta, Args extends any[], Ret>(
		method: (meta: Meta, ...args: Args) => Promise<Ret>,
		getMeta: () => Promise<Meta>,
	) {
	return async(...args: Args) => method(await getMeta(), ...args)
}

function curryMethodMetaOption<Meta, Options extends {}, Args extends any[], Ret>(
		method: (options: Options & {meta: Meta}, ...args: Args) => Promise<Ret>,
		getMeta: () => Promise<Meta>,
	) {
	return async(options: Omit<Options, "meta">, ...args: Args) => method({
		...(<Options>options),
		meta: await getMeta(),
	}, ...args)
}

type Shift<T extends any[]> =
	T["length"] extends 0 ? undefined :
	(((...b: T) => void) extends (a: any, ...b: infer I) => void ? I : [])

type CurryMetaTopic<T extends Topic> = {
	[P in keyof T]: (
		options: Omit<Parameters<T[P]>[0], "meta">,
		...args: Shift<Parameters<T[P]>>
	) => ReturnType<T[P]>
}

function curryTopicMetaOption<T extends Topic, Meta>(
		topic: T,
		getMeta: () => Promise<Meta>,
	): CurryMetaTopic<T> {
	return objectMap3<T, CurryMetaTopic<T>>(topic, method => {
		return curryMethodMetaOption(method, getMeta)
	})
}

const topic = {
	async rofl(o: {truth: boolean, meta: {a: boolean}}, b: string) {}
}

const t2 = curryTopicMetaOption(topic, async() => ({a: true}))
t2.rofl({truth: true}, "true")

// function augmentMethodMetaOptionTransform<Meta, Transform, Options extends {}, Args extends any[], Ret>(
// 		method: (options: Options & {transform: Transform}, ...args: Args) => Promise<Ret>,
// 		getTransform: (meta: Meta) => Promise<Transform>,
// 	) {
// 	return async(options: Omit<Options, "transform"> & {meta: Meta}, ...args: Args) => method({
// 		...(<any>options),
// 		transform: await getTransform(options.meta),
// 	}, ...args)
// }
