
import {exampleApi} from "./example-api.js"
import {ToRemote} from "../types/remote/to-remote.js"

export interface ExampleMeta {
	token: string
}

export interface ExampleAuth {
	doctorate: boolean
}

export type ExampleApi = typeof exampleApi
export type ExampleRemote = ToRemote<ExampleApi>
