
export type HttpRequest = {
	body: string
	headers: {
		origin: string
		[key: string]: string
	}
}
