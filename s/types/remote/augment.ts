
export type Augment<xAuth> = {
	getAuth: () => Promise<xAuth>
}
