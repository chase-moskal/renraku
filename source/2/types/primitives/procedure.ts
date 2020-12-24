
export type Procedure<
	xMeta extends any,
	xArgs extends any[],
	xResult extends any,
> = (meta: xMeta, ...args: xArgs) => Promise<xResult>
