
export type HttpRequest = {
	body: string
	headers: {
		origin: string
		[key: string]: string
	}
}

export type HttpResponse = {
	body: string
	status: number
	contentType: string
}

export function jsonResponse(result: any): HttpResponse {
	return {
		status: 200,
		body: JSON.stringify(result),
		contentType: "application/json",
	}
}

export function errorResponse(code: number, error: string): HttpResponse {
	return {
		body: error,
		status: code,
		contentType: "text/plain",
	}
}

export type Method = (request: HttpRequest, ...args: any[]) => Promise<HttpResponse>

export type Topic = {
	[key: string]: Topic | Method
}

export type AMethod<M extends any, A extends any[], R extends any> = (meta: M, ...args: A) => Promise<R>
export type ATopic = {
	[key: string]: ATopic | AMethod<any, any[], any>
}

export function asATopic<T extends ATopic>(topic: T) {
	return topic
}

export function asTopic<T extends Topic>(topic: T) {
	return topic
}

export type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

export type AugMethod<Meta extends any, Meth extends Method> = (meta: Meta, ...args: DropFirst<Parameters<Meth>>) => ReturnType<Meth>

export type AugTopic<Meta extends any, T extends Topic> = {
	[P in keyof T]: T[P] extends Topic
		? AugTopic<Meta, T[P]>
		: T[P] extends Method
			? AugMethod<Meta, T[P]>
			: never
}

export type AugTopic2<Meta extends any, T extends ATopic> = {
	[P in keyof T]: T[P] extends ATopic
		? AugTopic2<Meta, T[P]>
		: T[P] extends AMethod<any, any[], any>
			? AMethod<Meta, DropFirst<Parameters<T[P]>>, ReturnType<T[P]>>
			: never
}

export type ToHttpTopic<Auth extends any, T extends ATopic> = {
	[P in keyof T]: T[P] extends ATopic
		? ToHttpTopic<Auth, T[P]>
		: T[P] extends AMethod<any, any[], any>
			? (request: HttpRequest, auth: Auth, ...args: DropFirst<Parameters<T[P]>>) => HttpResponse
			: never
}

export function asAugmentedTopic<Meta extends any, T extends Topic, AT extends AugTopic<Meta, T>>(topic: AT) {
	return topic
}

export async function exampleServer2() {

	function makeApi(topic: Topic) {
		return async function remoteProcedureCall(request: HttpRequest) {
			const {specifier, args} = readJsonRequest(request)
			const result = await executeMethod(topic, specifier)
			return jsonResponse(result)
		}
	}

	function augmentTopic<
			Meta extends any,
			Augmentor extends (method: Method, request: HttpRequest, ...args: any[]) => Promise<HttpResponse>,
			T extends Topic,
		>(
			augmentor: Augmentor,
			topic: AugTopic<any, T>,
		): T {
		return
	}

	const at = asATopic({
		myTopic: {
			sum: async(meta, x: number, y: number) => {
				return "lol"
			}
		},
	})

	type Lol = ToHttpTopic<{}, typeof at>
	let lol: Lol

	lol.myTopic.sum()

	// const topic = asTopic({
	// 	myTopic: {
	// 		sum: async(request, meta, a: number, b: number) => {
	// 			return jsonResponse("lol")
	// 		},
	// 		// subTopic: {
	// 		// 	sum2: async(request: {}, meta: {}, a: number, b: number) => {}
	// 		// },
	// 	}
	// })

	const augmented = augmentTopic(
		async(method, request, ...args: any) => {
			const response = await method(request, ...args)
			return jsonResponse(response)
		},
		{
			myTopic: {
				lol: async(meta) => {
					return "abc"
				}
			},
		},
	)

	const api = makeApi(topic)
	const server = makeServer(api)
}
