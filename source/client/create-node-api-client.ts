
import * as fetch from "isomorphic-fetch"
import {prepareCreateApiClient} from "./prepare-create-api-client.js"

export const createNodeApiClient = prepareCreateApiClient(fetch)
