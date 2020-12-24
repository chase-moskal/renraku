
export type Api<xRequest, xResponse> = (request: xRequest) => Promise<xResponse>
