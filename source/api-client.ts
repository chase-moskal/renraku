
import {prepareApiClient} from "./internals/client/prepare-client-creator.js"

export const apiClient = prepareApiClient(window.fetch)
