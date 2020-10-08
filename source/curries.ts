
import {objectMap} from "./internals/object-map.js"
import {Api, Topic, Shift, CurriedTopicMeta, CurriedApiMeta, TopicServerside, Augmentation} from "./types.js"

// curry functions
//

export function curryTopicMeta<T extends Topic, Meta>(
		getMeta: () => Promise<Meta>,
		topic: T,
	): CurriedTopicMeta<T> {
	return objectMap<T, CurriedTopicMeta<T>>(
		topic,
		method => curryMethodMeta(getMeta, method),
	)
}

export function curryApiMeta<A extends Api, Meta>(
		getMeta: () => Promise<Meta>,
		api: A,
	): CurriedApiMeta<A> {
	return objectMap<A, CurriedApiMeta<A>>(
		api,
		topic => curryTopicMeta(getMeta, topic)
	)
}

export function augmentTopic<
		Context,
		XTopic extends TopicServerside,
		Ret,
		Aug extends Augmentation<Context, Ret>,
	>(
		augmentation: Aug,
		topic: {
			[P in keyof XTopic]:
				(...args: Shift<Parameters<XTopic[P]>>) => Ret
		},
	): {
		[P in keyof XTopic]:
			(context: Context, ...args: Shift<Parameters<XTopic[P]>>) =>
				ReturnType<XTopic[P]>
	} {
	return objectMap(
		topic,
		method => methodAugment(augmentation, method),
	)
}

export function augmentApi<
		A extends Api,
		Aug extends Augmentation<Context, Ret>,
		Context,
		Ret
	>(
		augmentation: Aug,
		api: A,
	) {
	return objectMap(api, topic => augmentTopic(augmentation, topic))
}

export function topicTransform<
		Meta,
		Payload,
		PTopic extends {
			[key: string]: (payload: Payload, ...args: any[]) => Promise<any>
		},
	>(
		transformer: (meta: Meta) => Promise<Payload>,
		topic: PTopic,
	): {
		[P in keyof PTopic]: (
			meta: Meta,
			...args: Shift<Parameters<PTopic[P]>>
		) => ReturnType<PTopic[P]>
	} {
	return objectMap(topic, method => {
		return methodTransform(transformer, method)
	})
}

// method curries
//

function curryMethodMeta<Meta, Args extends any[], Ret>(
		getMeta: () => Promise<Meta>,
		method: (meta: Meta, ...args: Args) => Promise<Ret>,
	) {
	return async(...args: Args) => method(await getMeta(), ...args)
}

function methodTransform<
		Meta,
		Payload,
		Transformer extends (meta: Meta) => Promise<Payload>,
		Method extends (payload: Payload, ...args: Args) => Promise<Ret>,
		Args extends any[],
		Ret extends any,
	>(
		transformer: Transformer,
		method: Method,
	) {
	return async(meta: Meta, ...args: Args) => {
		const payload = await transformer(meta)
		return method(payload, ...args)
	}
}

function methodAugment<
		Context,
		Aug extends Augmentation<Context, Ret>,
		Method extends (...args: Args) => Promise<Ret>,
		Args extends any[],
		Ret extends any,
	>(
		augmentation: Aug,
		method: Method,
	) {
	return async(context: Context, ...args: Args) => {
		await augmentation(context)
		return method(...args)
	}
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


// // meta-as-option curries
// // DEPRECATED
// //

// export function curryTopicMetaOption<T extends Topic, Meta>(
// 		topic: T,
// 		getMeta: () => Promise<Meta>,
// 	): CurryMetaTopic<T> {
// 	return objectMap<T, CurryMetaTopic<T>>(
// 		topic,
// 		method => curryMethodMetaOption(method, getMeta),
// 	)
// }

// export function curryApiMetaOption<A extends Api, Meta>(
// 		api: A,
// 		getMeta: () => Promise<Meta>
// 	): CurryMetaApi<A> {
// 	return objectMap<A, CurryMetaApi<A>>(
// 		api,
// 		topic => curryTopicMetaOption(topic, getMeta)
// 	)
// }

// type CurryMetaApi<A extends Api> = {
// 	[P in keyof A]: CurryMetaTopic<A[P]>
// }

// function curryMethodMetaOption<Meta, Options extends {}, Args extends any[], Ret>(
// 		method: (options: Options & {meta: Meta}, ...args: Args) => Promise<Ret>,
// 		getMeta: () => Promise<Meta>,
// 	) {
// 	return async(options: Omit<Options, "meta">, ...args: Args) => method({
// 		...(<Options>options),
// 		meta: await getMeta(),
// 	}, ...args)
// }
