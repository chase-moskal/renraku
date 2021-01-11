
export type Procedure<
	xAuth,
	xArgs extends any[],
	xResult,
> = (auth: xAuth, ...args: xArgs) => Promise<xResult>
