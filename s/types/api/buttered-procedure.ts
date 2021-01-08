
import {Policy} from "../primitives/policy.js"
import {Procedure} from "../primitives/procedure.js"
import {butterSymbol} from "../symbols/butter-symbol.js"

export type ButteredProcedure<xAuth, xMeta, xArgs extends any[], xResult, xPolicy extends Policy<xAuth, xMeta>> = {
	[butterSymbol]: true
	policy: xPolicy
	func: Procedure<xMeta, xArgs, xResult>
}
