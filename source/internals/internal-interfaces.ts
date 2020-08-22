
import {SignatureSignOptions} from "redcrypto/dist/types.js"

export interface Order {
	topic: string
	func: string
	params: any[]
}

export type SignatureSign = (options: SignatureSignOptions) => string
