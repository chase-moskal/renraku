
import {isNode} from "./is-node.js"

export const smartImport = <T>(path: String) => (
	async(): Promise<T> => isNode
		? (await import(`./node/${path}`))
		: (await import(`./browser/${path}`))
)()
