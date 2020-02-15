
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _fetch from "isomorphic-fetch"
const fetch = require("fetch") as typeof _fetch

import {prepareApiClient} from "./internals/client/prepare-api-client.js"

export const apiNodeClient = prepareApiClient(fetch)
