
# changelog for `renraku`

### legend

- 🟥 *harmful -- breaking change*
- 🔶 *maybe harmful -- deprecation, or possible breaking change*
- 🍏 *harmlesss -- addition, fix, or enhancement*

<br/>

## v0.3

### v0.3.0

- 🟥 replaced `expose` function with similar new `endpoint` function
  ```ts
  // OLD -- this is outdated
  new HttpServer(expose(({headers}) => fns))

  // NEW -- do it like this now
  new HttpServer(({headers}) => endpoint(fns))
  ```
  - this new design is cleaner, and non-http apis like postMessage don't need to pretend and pass fake headers like before
  - we also removed the concept of an `Api` type and the `api` helper function
  - if you were using `api`, you are now expected to roll-your-own, like this:
    ```ts
    // OLD
    const myApi = api(({headers}) => ({...myFunctions}))
    new HttpServer(expose(myApi))

    // NEW
    import {ServerMetas} from "renraku"
    const myApi = ({headers}: ServerMetas) => ({...myFunctions})
    new HttpServer(meta => endpoint(myApi(meta)))
    ```

<br/>

## v0.2

### v0.2.0

- 🟥 totally massive rewrite
  - everything has changed, deal with it 😎
  - you're gonna have to just read the new readme 💀

<br/>

## v0.1

- undocumented small tweaks and renames

<br/>

## v0.0

### v0.0.0-dev.53

- (breaking) added required parameter `timeout` to websocket server and client

### v0.0.0-dev.45

- (breaking) mass renames

  we removed all the `renraku` prefixes from various names

  it's now recommended to `import * from "renraku"`, and rename things like `renrakuApi` to `renraku.api`

- add an option for `renraku.mock` called `spike`, which allows you to intercept and manipulate outgoing calls. this is used for implementing logging or mock latency.

### v0.0.0-dev.44

- (breaking) complete renraku rewrite!

  you have to redo your renraku implementation. *sorry not sorry*

### v0.0.0-dev.43

- (breaking) remove mockRemote's withMeta and forceAuth with the newer more-capable `useMeta` and `useAuth`

### v0.0.0-dev.40

- (breaking) simplified signatures for policy, augment, apiContext
- (breaking) rename some interfaces like ToRemote to Remote, ToApiContext to ApiContext
- (breaking) rename _augment symbol to _meta
- rework readme tutorial accordingly

### v0.0.0-dev.39

- start of changelog

