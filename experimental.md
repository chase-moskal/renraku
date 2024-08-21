
# RENRAKU experimental features

## `notify` and `query`

json-rpc has two kinds of requests: "queries" expect a response, and "notifications" do not.  
renraku supports both of these.

### let's start with a `remote`

```ts
import {remote, query, notify, settings} from "renraku"

const fns = remote(endpoint)
```

### use symbols to specify request type

- use the `notify` symbol like this to send a notification request
  ```ts
  await fns.hello.world[notify]()
    // you'll get null, because notifications have no responses
  ```
- use the `query` symbol to launch a query request which will await a response
  ```ts
  await fns.hello.world[query]()

  // query is the default, so usually this is equivalent:
  await fns.hello.world()
  ```

### use the `settings` symbol to set-and-forget

```ts
// changing the default for this request
fns.hello.world[settings].notify = true

// now this is a notification
await fns.hello.world()

// unless we override and specify otherwise
await fns.hello.world[query]()
```

### you can even make your whole remote default to `notify`

```ts
const fns = remote(endpoint, {notify: true})

// now all requests are assumed to be notifications
await fns.hello.world()
await fns.anything.goes()
```

