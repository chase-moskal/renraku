
export type Policy<xMeta, xAuth> = {
	processAuth: (meta: xMeta) => Promise<xAuth>
}
