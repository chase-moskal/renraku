
export type Requester<xAuth> = (options: {
	link: string
	auth: xAuth
	args: any[]
	specifier: string
}) => Promise<any>
