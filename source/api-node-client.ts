
import * as fetch from "isomorphic-fetch"
import {prepareApiClient} from "./internals/client/prepare-api-client.js"

export const apiNodeClient = prepareApiClient(fetch)
