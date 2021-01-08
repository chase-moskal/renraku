
import {Policy} from "../primitives/policy.js"
import {Procedure} from "../primitives/procedure.js"
import {_descriptor} from "../symbols/descriptor-symbol.js"

export type ProcedureDescriptor<xAuth, xMeta, xArgs extends any[], xResult, xPolicy extends Policy<xAuth, xMeta>> = {
	[_descriptor]: true
	policy: xPolicy
	func: Procedure<xMeta, xArgs, xResult>
}
