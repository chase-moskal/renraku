
import {prepareApiClient} from "../isomorphic/prepare-api-client.js"

export const apiClient = prepareApiClient({fetch: window.fetch})
