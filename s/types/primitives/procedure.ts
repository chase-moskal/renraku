
export type Procedure<
	xMeta,
	xArgs extends any[],
	xResult,
> = (meta: xMeta, ...args: xArgs) => Promise<xResult>
