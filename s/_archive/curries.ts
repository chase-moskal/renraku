
import {objectMap} from "./internals/object-map.js"
import {Api, Topic, AddMetaTopic, AddMetaApi, Augmentation, ClientContext, ClientResponse, DeclientizeTopic, DeclientizeApi, ServerContext, ProcessPayloadTopic, ServerizeTopic, ServerizeApi} from "./types.js"

// COMMON
//

export function processPayload<
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

export function processPayloadTopic<
		Meta,
		Payload,
		Top extends {
			[key: string]: (payload: Payload, ...args: any[]) => Promise<any>
		},
	>(
		transformer: (meta: Meta) => Promise<Payload>,
		topic: Top,
	): ProcessPayloadTopic<Meta, Top> {
	return objectMap(topic, method => {
		return processPayload(transformer, method)
	})
}

// CLIENTSIDE
//

export function addMeta<
		Meta,
		Meth extends (meta: Meta, ...args: any[]) => Promise<Ret>,
		Args extends any[],
		Ret,
	>(
		getMeta: () => Promise<Meta>,
		method: Meth,
	) {
	return async(...args: Args) => method(await getMeta(), ...args)
}

export function addMetaTopic<T extends Topic, Meta>(
		getMeta: () => Promise<Meta>,
		topic: T,
	): AddMetaTopic<T> {
	return objectMap<T, AddMetaTopic<T>>(
		topic,
		method => addMeta(getMeta, method),
	)
}

export function addMetaApi<A extends Api, Meta>(
		getMeta: () => Promise<Meta>,
		api: A,
	): AddMetaApi<A> {
	return objectMap<A, AddMetaApi<A>>(
		api,
		topic => addMetaTopic(getMeta, topic),
	)
}

export function declientize<Args extends any[]>(
		getRequest: () => Promise<ClientContext>,
		processResponse: (response: ClientResponse) => Promise<any>,
		method: (request: ClientContext, ...args: Args) => Promise<ClientResponse>,
	) {
	return async(...args: Args) => {
		const response = await method(await getRequest(), ...args)
		return await processResponse(response)
	}
}

export function declientizeTopic<T extends Topic>(
		getRequest: () => Promise<ClientContext>,
		processResponse: (response: ClientResponse) => Promise<any>,
		topic: T,
	): DeclientizeTopic<T> {
	return objectMap(
		topic,
		method => declientize(
			getRequest,
			processResponse,
			method,
		)
	)
}

export function declientizeApi<A extends Api>(
		getRequest: () => Promise<ClientContext>,
		processResponse: (response: ClientResponse) => Promise<any>,
		api: A,
	): DeclientizeApi<A> {
	return objectMap(
		api,
		topic => declientizeTopic(
			getRequest,
			processResponse,
			topic,
		)
	)
}

// SERVERSIDE
//

export function serverize<
		Context extends ServerContext,
		Args extends any[],
		Ret,
	>(
		augmentation: Augmentation<Ret>,
		method: (...args: Args) => Promise<Ret>,
	) {
	return async(context: Context, ...args: Args) => {
		const toResponse = await augmentation(context)
		const result = await method(...args)
		return toResponse(result)
	}
}

export function serverizeTopic<
		Top extends Topic,
	>(
		augmentation: Augmentation,
		topic: Topic,
	): ServerizeTopic<Top> {
	return objectMap(
		topic,
		method => serverize(augmentation, method),
	)
}

export function serverizeApi<
		A extends Api,
		Aug extends Augmentation,
	>(
		augmentation: Aug,
		api: A,
	): ServerizeApi<A> {
	return objectMap(api, topic => serverizeTopic(augmentation, topic))
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
