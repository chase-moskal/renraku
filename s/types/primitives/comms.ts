import { Responder } from "../api/responder.js"
import { ParseRequest } from "../api/parse-request"


export type Comms<xRequest, xResponse, xAuth = any> = {
	responder: Responder<xResponse>
	parseRequest: ParseRequest<xRequest, xAuth>
}
