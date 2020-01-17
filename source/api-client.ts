
import {prepareApiClient} from "./internals/client/prepare-api-client.js"

export const apiClient = prepareApiClient(window.fetch)
