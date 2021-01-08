
import {RemoteProcedureCall} from "./remote-procedure-call.js"

export type ParseRequest<xRequest, xAuth> = (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
