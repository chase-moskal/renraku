
export namespace JsonRpc {
	export type Incoming = Request | Request[]
	export type Outgoing = Response | Response[]

	/////////////////////////////////////////////////////////////

	export const version = "2.0"

	export type Request<P extends [] | {} = any> = (
		| Query<P>
		| Notification<P>
	)

	export type Response<Result = any> = (
		| Success<Result>
		| Failure
	)

	/////////////////////////////////////////////////////////////

	export type Id = number | string | null

	export type Notification<P extends [] | {}> = {
		jsonrpc: string
		method: string
		params: P
	}

	export type Query<P extends [] | {}> = {
		id: Id
		jsonrpc: string
		method: string
		params: P
	}

	export type Error = {
		code: number
		message: string
		data?: any
	}

	export type Success<Result> = {
		jsonrpc: "2.0"
		id: Id
		result: Result
	}

	export type Failure = {
		jsonrpc: "2.0"
		id: Id
		error: Error
	}

	/////////////////////////////////////////////////////////////

	export function failure(error: any, id: Id, exposeErrors: boolean): Failure {
		return {
			id,
			jsonrpc: JsonRpc.version,
			error: (exposeErrors && error instanceof Error)
				? {
					code: -32000,
					message: `${error.name}: ${error.message}`,
					data: error.stack,
				}
				: {
					code: -32000,
					message: "error",
				},
		}
	}
}

