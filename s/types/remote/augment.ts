
export type Augment<xMeta> = {
	getMeta: () => Promise<xMeta>
}
