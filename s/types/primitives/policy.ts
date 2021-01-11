
export type Policy<xMeta, xAuth> = {
	processMeta: (meta: xMeta) => Promise<xAuth>
}
