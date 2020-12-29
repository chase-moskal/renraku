
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _fetch from "isomorphic-fetch"
const fetch = require("isomorphic-fetch") as typeof _fetch

import {prepareApiClient} from "../isomorphic/prepare-api-client.js"

export const apiClient = prepareApiClient({fetch})
