
import type {IncomingHttpHeaders} from "http"

export interface Logger {
	log(...data: any[]): void
	warn(...data: any[]): void
	error(...data: any[]): void
}

export interface Methods {
	[key: string]: (...args: any[]) => Promise<any>
}

export interface RenrakuHttpHeaders extends IncomingHttpHeaders {}

export interface RenrakuPolicy<xMeta, xAuth> {
	(meta: xMeta, headers?: RenrakuHttpHeaders): Promise<xAuth>
}

export interface Expose<xAuth, xMethods extends Methods> {
	(auth: xAuth): xMethods
}

export const is_renraku_service = Symbol("is_renraku_service")

export interface RenrakuService<xMeta, xAuth, xMethods extends Methods> {
	[is_renraku_service]: symbol
	policy: RenrakuPolicy<xMeta, xAuth>
	expose: Expose<xAuth, xMethods>
}

export interface RenrakuApi {
	[key: string]: RenrakuApi | RenrakuService<any, any, Methods>
}

export type RenrakuMetaMap<xApi extends RenrakuApi> = {
	[P in keyof xApi]: xApi[P] extends RenrakuService<infer xMeta, any, Methods>
		? () => Promise<xMeta>
		: xApi[P] extends RenrakuApi
			? RenrakuMetaMap<xApi[P]>
			: never
}

export type AuthMap<xApi extends RenrakuApi> = {
	[P in keyof xApi]: xApi[P] extends RenrakuService<any, infer xAuth, Methods>
		? () => Promise<xAuth>
		: xApi[P] extends RenrakuApi
			? AuthMap<xApi[P]>
			: never
}

export type ApiRemote<xApi extends RenrakuApi> = {
	[P in keyof xApi]: xApi[P] extends RenrakuService<any, any, infer xMethods>
		? xMethods
		: xApi[P] extends RenrakuApi
			? ApiRemote<xApi[P]>
			: never
}

export type RenrakuRemote<X extends RenrakuService<any, any, any> | RenrakuApi> =
	X extends RenrakuService<any, any, infer xMethods>
		? xMethods
		: X extends RenrakuApi
			? ApiRemote<X>
			: never

export interface RenrakuRequest {
	meta: any
	method: string
	params: any[]
	headers?: RenrakuHttpHeaders
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

export interface RenrakuMockLatency {
	min: number
	max: number
}

export interface MockOptions {
	getMockLatency?: () => undefined | RenrakuMockLatency
}

export interface RenrakuSpike {
	(methodName: string, func: (...params: any[]) => Promise<any>, ...params: any): Promise<any>
}

export interface RenrakuServiceOptions {
	spike?: RenrakuSpike
}
