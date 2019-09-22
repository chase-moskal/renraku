
import {prepareCreateApiClient} from "./prepare-create-api-client.js"

export const createBrowserApiClient = prepareCreateApiClient(window.fetch)
