import { RemoteProcedureCall } from "./remote-procedure-call.js"

//
// API CONTEXT
//

export type ParseRequest<xRequest, xAuth> = (request: xRequest) => Promise<RemoteProcedureCall<xAuth>>
