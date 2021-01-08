
import {ToApiContext} from "./to-api-context.js"

export type ApiGroup = ToApiContext<any, any, any, any> | {
	[key: string]: ToApiContext<any, any, any, any> | ApiGroup
}
