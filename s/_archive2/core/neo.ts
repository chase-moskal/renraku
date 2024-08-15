
import {JsonRpc} from "./json-rpc.js"
import {HttpHeaders} from "./types.js"
import {obtain} from "../tools/obtain.js"
import {objectMap} from "../tools/object-map.js"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = Record<string, Fn>

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

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

export function makeRemoteProxy(
		executor: (path: string[], args: any[]) => void
	) {

	function recurse(path: string[]) {
		return new Proxy({} as any, {
			apply: (_, _this, args) => executor(path, args),
			get: (target, key: string) => {
				return target[key] ?? recurse([...path, key])
			},
			set: (target, key: string, value: any) => {
				target[key] = value
				return true
			},
		})
	}

	return recurse([])
}

export function service<A, Fs extends Fns>(s: (auth: A) => Promise<Fs>) {
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

export function provide<A, Fs extends AuthFns<A>>(auth: A, fns: Fs) {
	return objectMap(
		fns,
		fn => async(...p: any[]) => fn(auth, ...p),
	) as AuthUnwrap<Fs>
}

export type EndpointDetails = {
	headers: HttpHeaders
	exposeErrors: boolean
}

export type Endpoint = (
	(request: JsonRpc.Request, details?: EndpointDetails) =>
		Promise<JsonRpc.Response | null>
)

export function expose<Fs extends Fns>(services: Fs): Endpoint {
	return async(request, details = {exposeErrors: false, headers: {}}) => {
		// remove leading dot
		const method = request.method.startsWith(".")
			? request.method.slice(1)
			: request.method
		const path = method.split(".")
		const fn = obtain(services, path) as Fn
		const action = async() => await fn(...request.params.args)
		return await respond(request, action, details.exposeErrors)
	}
}

async function respond(
		request: JsonRpc.Request,
		fn: () => Promise<any>,
		exposeErrors: boolean,
	): Promise<JsonRpc.Response | null> {

	try {
		const result = await fn()
		if (!("id" in request))
			return null
		return {
			result,
			id: request.id,
			jsonrpc: JsonRpc.version,
		}
	}

	catch (error) {
		if (!("id" in request))
			return null
		return JsonRpc.failure(error, request.id, exposeErrors)
	}
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

export const myService = service(async(auth: string) => {
	const user = {auth}
	return {
		async sum(a: number, b: number) {
			console.log(user)
			return a + b
		},
	}
})

const authed = provide("hello", myService)

const r1 = await myService.sum("hello", 1, 2)
const r2 = await authed.sum(1, 2)

