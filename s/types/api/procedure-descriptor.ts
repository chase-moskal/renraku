
import {Policy} from "../primitives/policy.js"
import {Procedure} from "../primitives/procedure.js"
import {_descriptor} from "../symbols/descriptor-symbol.js"

export type ProcedureDescriptor<xMeta, xAuth, xArgs extends any[], xResult, xPolicy extends Policy<xMeta, xAuth, any>> = {
	[_descriptor]: true
	policy: xPolicy
	func: Procedure<xAuth, xArgs, xResult>
}
