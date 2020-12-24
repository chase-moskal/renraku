
export type RequestAuthorizer<xRequest, xAuth, xMeta> = (
	request: xRequest,
	auth: xAuth,
) => Promise<xMeta>
