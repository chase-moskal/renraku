
export type Policy<xAuth, xMeta> = {
	processAuth: (auth: xAuth) => Promise<xMeta>
}
