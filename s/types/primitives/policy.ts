
import {HttpRequest} from "../http/http-request.js"

export type Policy<xMeta, xAuth, xRequest = HttpRequest> = {
	processAuth: (meta: xMeta, request: xRequest) => Promise<xAuth>
}
