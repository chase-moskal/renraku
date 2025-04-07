
# changelog for `renraku`

- 🟥 *harmful -- breaking change*
- 🔶 *maybe harmful -- deprecation, or possible breaking change*
- 🍏 *harmlesss -- addition, fix, or enhancement*

<br/>

## v0.5

### v0.5.0-3
- 🟥 rework package `exports` for nodejs
  ```ts
    //    ❌ old bad entrypoint --------.
    //                                   \
  import {WebSocketServer} from "renraku/x/server.js"

    //    ✅ new good entrypoint -------.
    //                                   \
  import {WebSocketServer} from "renraku/node"
  ```
  - previously i actually tried to do the fancy auto environment detection thing, but ts lsp didn't seem to jive with it
  - so now i'm going with a simpler explicit pattern
- 🔶 change messenger portal types, rename `MessageBindables` to `PortalChannel`
- 🍏 add `AsFns` helper type, to keep your fn types honest

### v0.5.0-2
- 🔶 rename `advanced` symbol to `tune`
- 🔶 rename `logistics` symbol to `rig`

### v0.5.0-1
- 🟥 added optional `transfer` argument to Endpoint type
- 🟥 added required `logistics` argument to `Bidirectional->receive`
- 🔶 deprecate `PostMessenger` in favor of new `Messenger`
- 🍏 add new remote fn symbol `advanced` which allows us to specify `transfer` on remote requests
- 🍏 messenger has `logistics` system allowing us to specify `transfer` in local responses

## v0.4

### v0.4.3 — v0.4.5
- 🍏 updated dependencies
- 🍏 fixed proxies for async returns
- 🍏 improved readme

### v0.4.2
- 🍏 isColorSupported accepts env var `FORCE_COLOR`
- 🍏 deathWithDignity now doesn't die on uncaught errors
  -  added option `dieOnUncaught` which you can set `true` if you are a severe person

### v0.4.1
- 🍏 fix efficiency issue in webSocketRemote

### v0.4.0
changes and improvements
- 🍏 added new export `RandomUserEmojis`
- 🟥 revise arguments for `deadline(timeout, message, fn)`
- 🟥 require `onClose` in `webSocketRemote`
- 🟥 in webSocketRemote, rename `fns` to `remote`
  ```ts
  // BAD old way
  const {fns: serverside} = await webSocketRemote<Serverside>(options)

  // GOOD new way
  const {remote: serverside} = await webSocketRemote<Serverside>(options)
  ```

logging and error handling has been revised and greatly improved.
- 🔶 simplified RemoteError constructor to just take a message like ordinary Error
- 🟥 replaced `onInvocation(request, response)` with `onCall(request, remote)`
- 🟥 replaced endpoint `onError` with `onCallError`
- 🟥 replace `PrettyLogger` with `loggers`
  - now you just import `loggers` which is an instance of `Loggers`
  - it attempts to detect if the tty supports ansi colors
  - the loggers instance has ready-made functions `onCall`, `onCallError`, and `onError` for renraku logging
    - these are now the defaults
  - renraku now defaults to logging everything
    - i realized the first thing a developer wants to do, is see that their api is working, and probably start troubleshooting
    - it was just unacceptable to setup renraku and immediately see nothing and be confused and then have a chore to setup logging
    - so now, you can disable logging by passing empty functions for onCall/onCallError/onError
    - i suppose you could actually set those empty functions on the `logger` instance 🤔

## v0.3

### v0.3.0

- 🟥 WebSocketServer `acceptConnection` is now an async function
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
- 🟥 rename `maxPayloadBytes` to `maxRequestBytes`
- 🍏 new `PostMessenger` for bidirectional postmessage apis
- 🍏 add `timeout` for HttpServer and also WebSocketServer, defaults to 10 seconds.

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

