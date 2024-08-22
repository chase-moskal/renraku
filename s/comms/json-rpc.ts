
export namespace JsonRpc {
	export type Requestish = Request | Request[]
	export type Respondish = Response | Response[]
	export type Bidirectional = Requestish | Respondish

	/////////////////////////////////////////////////////////////

	export const version = "2.0"

	export type Request<P extends Params = any> = (
		| Query<P>
		| Notification<P>
	)

	export type Response<Result = any> = (
		| Success<Result>
		| Failure
	)

	/////////////////////////////////////////////////////////////

	export type Id = number | string | null
	export type Params = any[] | {}

	export type Notification<P extends Params> = {
		jsonrpc: string
		method: string
		params: P
	}

	export type Query<P extends Params> = {
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

	export function getId(request: Request): Id {
		return "id" in request
			? request.id
			: null
	}
}

