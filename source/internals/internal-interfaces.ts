
import {SignatureSignOptions} from "redcrypto/dist/interfaces.js"

export interface Order {
	topic: string
	func: string
	params: any[]
}

export type SignatureSign = (options: SignatureSignOptions) => string
