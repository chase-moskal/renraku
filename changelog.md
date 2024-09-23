
# changelog for `renraku`

### legend

- 🟥 *harmful -- breaking change*
- 🔶 *maybe harmful -- deprecation, or possible breaking change*
- 🍏 *harmlesss -- addition, fix, or enhancement*

<br/>

## v0.2

### v0.2.0

- 🟥 totally massive rewrite
  - everything has changed, deal with it 😎

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

