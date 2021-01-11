
import {Await} from "../tools/await.js"
import {Topic} from "../primitives/topic.js"
import {ContextHint} from "./context-hint.js"
import {Policy} from "../primitives/policy.js"
import {DropFirst} from "../tools/drop-first.js"
import {Procedure} from "../primitives/procedure.js"
import {ProcedureDescriptor} from "./procedure-descriptor.js"
import {_context} from "../symbols/context-symbol.js"

export type ToApiContext<xMeta, xAuth, xTopic extends Topic<xAuth>, xPolicy extends Policy<xMeta, xAuth>> = {
	[P in keyof xTopic]: xTopic[P] extends Procedure<xAuth, any[], any>
		? ProcedureDescriptor<xMeta, xAuth, DropFirst<Parameters<xTopic[P]>>, Await<ReturnType<xTopic[P]>>, xPolicy>
		: xTopic[P] extends Topic<xAuth>
			? ToApiContext<xMeta, xAuth, xTopic[P], xPolicy>
			: never
} & {[_context]: ContextHint<xMeta>}
