
import {ApiContext} from "./api-context.js"

export type Api = ApiContext<any, any, any, any> | {
	[key: string]: ApiContext<any, any, any, any> | Api
}
