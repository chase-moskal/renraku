
import * as fetch from "isomorphic-fetch"
import {prepareApiClient} from "./internals/client/prepare-client-creator.js"

export const apiNodeClient = prepareApiClient(fetch)
