
export type Requester<xMeta> = (options: {
	link: string
	meta: xMeta
	args: any[]
	specifier: string
}) => Promise<any>
