
import {exampleApi} from "./example-api.js"
import {Remote} from "../types/remote/remote.js"

export interface ExampleMeta {
	token: string
}

export interface ExampleAuth {
	doctorate: boolean
}

export type ExampleApi = typeof exampleApi
export type ExampleRemote = Remote<ExampleApi>
