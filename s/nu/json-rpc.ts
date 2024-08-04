
export namespace JsonRpc {

	export type Request<PreAuth = any, Args extends any[] = any[]> = {
		jsonrpc: "2.0"
		id?: Id
		method: string
		params: {
			preAuth: PreAuth
			args: Args
		}
	}

	export type Response<Result = any> = (
		| Success<Result>
		| Failure
	)

	export type Incoming = Request | Request[]
	export type Outgoing = Response | Response[]

	////////////////////////////////////// ////////////////////////////////////

	export type Id = number | string | null

	export type Error = {
		code: number
		message: string
		data?: any
	}

	export type Success<Result = any> = {
		jsonrpc: "2.0"
		id: Id
		result: Result
	}

	export type Failure = {
		jsonrpc: "2.0"
		id: Id
		error: Error
	}
}

