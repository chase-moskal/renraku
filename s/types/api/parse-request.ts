
import {RemoteProcedureCall} from "./remote-procedure-call.js"

export type ParseRequest<xRequest, xMeta> = (request: xRequest) => Promise<RemoteProcedureCall<xMeta>>
