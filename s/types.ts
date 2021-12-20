
export interface Logger {
	log(...data: any[]): void
	warn(...data: any[]): void
	error(...data: any[]): void
}

export interface Methods {
	[key: string]: (...args: any[]) => Promise<any>
}

export interface RenrakuPolicy<xMeta, xAuth> {
	(meta: xMeta): Promise<xAuth>
}

export interface Expose<xAuth, xMethods extends Methods> {
	(auth: xAuth): xMethods
}

export const is_renraku_service = Symbol("is_renraku_service")

export interface Service<xMeta, xAuth, xMethods extends Methods> {
	[is_renraku_service]: symbol
	policy: RenrakuPolicy<xMeta, xAuth>
	expose: Expose<xAuth, xMethods>
}

export interface Api {
	[key: string]: Api | Service<any, any, Methods>
}

export type MetaMap<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<infer xMeta, any, Methods>
		? () => Promise<xMeta>
		: xApi[P] extends Api
			? MetaMap<xApi[P]>
			: never
}

export type AuthMap<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<any, infer xAuth, Methods>
		? () => Promise<xAuth>
		: xApi[P] extends Api
			? AuthMap<xApi[P]>
			: never
}

export type ApiRemote<xApi extends Api> = {
	[P in keyof xApi]: xApi[P] extends Service<any, any, infer xMethods>
		? xMethods
		: xApi[P] extends Api
			? ApiRemote<xApi[P]>
			: never
}

export type RenrakuRemote<X extends Service<any, any, any> | Api> =
	X extends Service<any, any, infer xMethods>
		? xMethods
		: X extends Api
			? ApiRemote<X>
			: never

export interface RenrakuRequest {
	meta: any
	method: string
	params: any[]
}

export interface RenrakuResponse {
	result: any
}

export interface Requester {
	(request: RenrakuRequest): Promise<any>
}

export interface JsonRpcRequest {
	jsonrpc: "2.0"
	id: number
	method: string
	params: any[]
}

export interface JsonRpcRequestWithMeta extends JsonRpcRequest {
	meta: any
}

export interface JsonRpcResponseCommon {
	jsonrpc: "2.0"
	id: number
}

export interface JsonRpcSuccessResponse extends JsonRpcResponseCommon {
	result: any
}

export interface JsonRpcErrorResponse extends JsonRpcResponseCommon {
	error: {
		code: number
		message: string
		data?: any
	}
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse

export interface Servelet {
	(request: RenrakuRequest): Promise<any>
}

export interface Requester {
	(request: RenrakuRequest): Promise<any>
}

export interface RenrakuConnectionControls {
	close(): void
}
