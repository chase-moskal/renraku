
// import {Topic} from "../primitives/topic.js"
// import {Procedure} from "../primitives/procedure.js"
// import {ToHttpProcedure} from "./to-http-procedure.js"

// export type ToHttpTopic<xAuth extends any, xTopic extends Topic<any>> = {
// 	[P in keyof xTopic]: xTopic[P] extends Topic<any>
// 		? ToHttpTopic<xAuth, xTopic[P]>
// 		: xTopic[P] extends Procedure<any, any[], any>
// 			? ToHttpProcedure<xAuth, xTopic[P]>
// 			: never
// }
