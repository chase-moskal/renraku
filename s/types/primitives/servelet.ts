
export type Servelet<xRequest, xResponse> = (request: xRequest) => Promise<xResponse>
