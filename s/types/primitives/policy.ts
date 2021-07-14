
import {HttpRequest} from "../http/http-request.js"

export type Policy<xMeta, xAuth, xRequest = HttpRequest> =
	(meta: xMeta, request: xRequest) => Promise<xAuth>
