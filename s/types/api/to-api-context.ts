
import {Await} from "../tools/await.js"
import {Topic} from "../primitives/topic.js"
import {ContextHint} from "./context-hint.js"
import {Policy} from "../primitives/policy.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "../primitives/procedure.js"
import {ButteredProcedure} from "./buttered-procedure.js"
import {contextSymbol} from "../symbols/context-symbol.js"

export type ToApiContext<xAuth, xMeta, xTopic extends Topic<xMeta>, xPolicy extends Policy<xAuth, xMeta>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<xMeta, any[], any>
		? ButteredProcedure<xAuth, xMeta, DropFirst<Parameters<xTopic[P]>>, Await<ReturnType<xTopic[P]>>, xPolicy>
		: xTopic[P] extends Topic<xMeta>
			? ToApiContext<xAuth, xMeta, xTopic[P], xPolicy>
			: never
} & {[contextSymbol]: ContextHint<xAuth>}
