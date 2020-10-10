
import {objectMap} from "./internals/object-map.js"
import {Api, Topic, Shift, CurriedMethodMeta, CurriedTopicMeta, CurriedApiMeta, TopicServerside, Augmentation, ClientRequest, ClientResponse, CurriedTopicAugmentation, CurriedApiAugmentation, ServerRequest, Method} from "./types.js"

// CLIENTSIDE
//

export function curryMethodMeta<Meta, M extends (meta: Meta, ...args: Args) => Promise<any>, Args extends any[]>(
		getMeta: () => Promise<Meta>,
		method: M,
	) {
	return async(...args: Args) => method(await getMeta(), ...args)
}

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
		topic => curryTopicMeta(getMeta, topic),
	)
}

export function curryMethodAugmentation<Args extends any[]>(
		getRequest: () => Promise<ClientRequest>,
		processResponse: (response: ClientResponse) => Promise<any>,
		method: (request: ClientRequest, ...args: Args) => Promise<ClientResponse>,
	) {
	return async(...args: Args) => {
		const response = await method(await getRequest(), ...args)
		return await processResponse(response)
	}
}

export function curryTopicAugmentation<T extends Topic>(
		getRequest: () => Promise<ClientRequest>,
		processResponse: (response: ClientResponse) => Promise<any>,
		topic: T,
	): CurriedTopicAugmentation<T> {
	return objectMap(
		topic,
		method => curryMethodAugmentation(
			getRequest,
			processResponse,
			method,
		)
	)
}

export function curryApiAugmentation<A extends Api>(
		getRequest: () => Promise<ClientRequest>,
		processResponse: (response: ClientResponse) => Promise<any>,
		api: A,
	): CurriedApiAugmentation<A> {
	return objectMap(
		api,
		topic => curryTopicAugmentation(
			getRequest,
			processResponse,
			topic,
		)
	)
}

// SERVERSIDE
//

export function uncurryMethodMeta<
		Meta,
		Payload,
		Args extends any[],
	>(
		transformer: (meta: Meta) => Promise<Payload>,
		method: (payload: Payload, ...args: Args) => Promise<any>,
	) {
	return async(meta: Meta, ...args: Args) => {
		const payload = await transformer(meta)
		return method(payload, ...args)
	}
}

export function uncurryTopicMeta<
		Meta,
		Payload,
		Top extends {
			[key: string]: (payload: Payload, ...args: any[]) => Promise<any>
		},
	>(
		transformer: (meta: Meta) => Promise<Payload>,
		topic: Top,
	): {
		[P in keyof Top]: (
			meta: Meta,
			...args: Shift<Parameters<Top[P]>>
		) => ReturnType<Top[P]>
	} {
	return objectMap(topic, method => {
		return uncurryMethodMeta(transformer, method)
	})
}

export function uncurryMethodAugmentation<
		Request extends ServerRequest,
		Args extends any[],
	>(
		augmentation: Augmentation<Request>,
		method: (...args: Args) => Promise<any>,
	) {
	return async(request: Request, ...args: Args) => {
		const wha = await augmentation(request)
		return method(...args)
	}
}

export function uncurryTopicAugmentation<
		Req extends ServerRequest,
		Top extends TopicServerside,
	>(
		augmentation: Augmentation<Req>,
		topic: {
			[P in keyof Top]:
				(...args: Shift<Parameters<Top[P]>>) => any
		},
	): {
		[P in keyof Top]:
			(request: Req, ...args: Shift<Parameters<Top[P]>>) =>
				ReturnType<Top[P]>
	} {
	return objectMap(
		topic,
		method => uncurryMethodAugmentation(augmentation, method),
	)
}

export function uncurryApiAugmentation<
		A extends Api,
		Aug extends Augmentation<ServerRequest>,
	>(
		augmentation: Aug,
		api: A,
	) {
	return objectMap(api, topic => uncurryTopicAugmentation(augmentation, topic))
}

// method curries
//

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
