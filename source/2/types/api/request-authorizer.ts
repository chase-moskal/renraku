
import {HttpRequest} from "../http/http-request.js"

export type RequestAuthorizer<xAuth, xMeta> = (
	request: HttpRequest,
	auth: xAuth,
) => Promise<xMeta>
