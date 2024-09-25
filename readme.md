
# 連絡 <br/> ***R·E·N·R·A·K·U***

### 🎨 make beautiful typescript apis.

📦 **`npm i renraku`**  
💡 elegantly expose async functions  
🌐 node and browser  
🏛️ json-rpc 2.0  
🔌 http and websockets  
🚚 transport agnostic core  
🛡️ auth helpers  
🧪 testable  

<br/>

## ⛩️ *RENRAKU* — a simple idea

***"an api should just be a bunch of async functions."***

i had this idea in 2017, and since then i've been evolving the concept's implementation and typescript ergonomics.

this project is the result.

<br/>

## ⛩️ *RENRAKU* — let's make a happy http api

1. install renraku into your project
    ```sh
    npm i renraku
    ```
1. `example.ts` — a bunch of async functions
    ```ts
    export const exampleFns = {

      async now() {
        return Date.now()
      },

      async sum(a: number, b: number) {
        return a + b
      },
    }
    ```
1. `server.ts` — let's expose the functions on a node server
    ```ts
    import {exampleFns} from "./example.js"
    import {HttpServer, expose} from "renraku"

    new HttpServer(expose(() => exampleFns))
      .listen(8000)
    ```
1. `client.ts` — finally, let's call the functions from a web browser
    ```ts
      // note, we import the *type* here
      //    ↓
    import type {exampleFns} from "./example.js"
    import {httpRemote} from "renraku"

    const example = httpRemote<typeof exampleFns>("http://localhost:8000/")

    // now you get a "natural" calling syntax,
    // feels like ordinary async functions:

    await example.now()
      // 1723701145176

    await example.sum(1, 2)
      // 3
    ```

<br/>

## ⛩ *RENRAKU* — arbitrary nesting is cool

- you can use arbitrary object nesting to organize your api
  ```ts
  export const exampleFns = {

    date: {
      async now() {
        return Date.now()
      },
    },

    numbers: {
      math: {
        async sum(a: number, b: number) {
          return a + b
        },
      },
    },
  }
  ```
  - on the remote side, you'll get a natural calling syntax
    ```ts
    await example.date.now()
    await example.numbers.math.sum(1, 2)
    ```

## ⛩ *RENRAKU* — http headers

- remember when we exposed the functions on an http server?
  ```ts
  new HttpServer(expose(() => exampleFns))
    .listen(8000)
  ```
- well, that `expose` function provides http headers
  ```ts
    //               http headers
    //                      ↓
  new HttpServer(expose(({headers}) => ({
    async sum(a: number, b: number) {
      console.log("content type", headers["content-type"])
      return a + b
    },
  }))).listen(8000)
  ```
- if you're smart you can use the `api` helper to extract the functions to another file while keeping the types right
  ```ts
  import {api} from "renraku"

  export const exampleApi = api(({headers}) => ({
    async sum(a: number, b: number) {
      console.log("content type", headers["content-type"])
      return a + b
    },
  }))
  ```
  then you can expose it like this
  ```ts
  new HttpServer(expose(exampleApi))
    .listen(8000)
  ```
  and you can use that type in a remote like this
  ```ts
  const example = httpRemote<ReturnType<typeof exampleFns>>(
    "http://localhost:8000/"
  )
  ```

<br/>

## ⛩ *RENRAKU* — `secure` and `authorize`

- secure parts of your api by requiring auth
  ```ts
  import {secure} from "renraku"

  export const exampleFns = {

      // declaring this area requires auth
      //    |
      //    |   auth can be any type you want
      //    ↓                  ↓
    math: secure(async(auth: string) => {

      // here you can do any auth work you need,
      // (maybe get into bearer token crypto)
      if (auth !== "hello")
        throw new Error("failed fake authentication lol")

      // finally, return the functionality for this
      // authorized service
      return {
        async sum(a: number, b: number) {
          return a + b
        },
      }
    }),
  }
  ```
- on the clientside, the `auth` param is required
  ```ts
  import type {exampleFns} from "./example.js"
  import {httpRemote, authorize} from "renraku"

  const example = httpRemote<typeof exampleFns>("http://localhost:8000/")

  // you can provide the 'auth' as the first parameter
  await example.math.sum("hello", 1, 2)

  // or authorize a whole group of functions
  const math = authorize(example.math, async() => "hello")
    // it's an async function so you could refresh
    // tokens or whatever

  // this call has been authorized
  await math.sum(1, 2)
  ```

<br/>

## ⛩ *RENRAKU* — whimsical websockets

- here our example websocket setup is more complex because we're setting up two apis that can communicate bidirectionally.
- `ws/apis.js` — define your serverside and clientside apis
  ```ts
  import {api, Api} from "renraku"

  // first, we must declare our api types.
  // (otherwise, typescript gets thrown through a loop
  // due to the mutual cross-referencing)

  export type Serverside = {
    sum(a: number, b: number): Promise<number>
  }

  export type Clientside = {
    now(): Promise<number>
  }

  // now we can define the api implementations.

  export function makeServersideApi(clientside: Clientside) {
    return api<Serverside>(() => ({
      async sum(a, b) {

        // remember, each side can call the other
        await clientside.now()

        return a + b
      },
    }))
  }

  export function makeClientsideApi(getServerside: () => Serverside) {
    return api<Clientside>(() => ({
      async now() {
        return Date.now()
      },
    }))
  }
  ```
- `ws/server.js` — on the serverside, we create a websocket server
  ```ts
  import {WebSocketServer} from "renraku/x/node.js"
  import {Clientside, makeServersideApi} from "./apis.js"

  const server = new WebSocketServer({
    acceptConnection: ({remoteEndpoint}) => {
      const clientside = remote<Clientside>(remoteEndpoint)
      return {
        closed: () => {},
        localEndpoint: expose(makeServersideApi(clientside)),
      }
    },
  })

  server.listen(8000)
  ```
  - note that we have to import from `renraku/x/node.js`, because we keep all node imports separated to avoid making the browser upset
- `ws/client.js` — on the clientside, we create a websocket remote
  ```ts
  import {webSocketRemote, Api} from "renraku"
  import {Serverside, makeClientsideApi} from "./apis.js"

  const {socket, fns: serverside} = await webSocketRemote<Serverside>({
    url: "http://localhost:8000",
    getLocalEndpoint: serverside => expose(
      makeClientsideApi(() => serverside)
    ),
  })

  const result = await serverside.now()
  ```

<br/>

## ⛩ *RENRAKU* — `notify` and `query`

json-rpc has two kinds of requests: "queries" expect a response, and "notifications" do not.  
renraku supports both of these.

don't worry about this stuff if you're just making an http api, this is more for realtime applications like websockets or postmessage for squeezing out a tiny bit more efficiency.

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

### you can use the `Remote` type when you need these symbols

- the `remote` function applies the `Remote` type automatically
  ```ts
  const fns = remote(endpoint)

  // ✅ happy types
  await serverside.update[notify](data)
  ```
- but you might have a function that accepts some remote functionality
  ```ts
  async function whatever(serverside: Serverside) {

    // ❌ bad types
    await serverside.update[notify](data)
  }
  ```
- you might need to specify `Remote` to use the remote symbols
  ```ts
  import {Remote} from "renraku"

  async function whatever(serverside: Remote<Serverside>) {

    // ✅ happy types
    await serverside.update[notify](data)
  }
  ```

<br/>

## ⛩ *RENRAKU* — more about the core primitives

- **`expose`** — generate a json-rpc endpoint for an api
  ```ts
  import {expose} from "renraku"

  const endpoint = expose(timingApi)
  ```
  - the endpoint is an async function that accepts a json-rpc request and calls the given api, and then returns the result in a json-rpc response
  - basically, the endpoint's inputs and outputs can be serialized and sent over the network — this is the transport-agnostic aspect
  - you can make your own async function of type `Endpoint`, that sends requests across the wire to a server which feeds that request into its own exposed api endpoint
- **`remote`** — generate a nested proxy tree of invokable functions
  - you need to provide the api type as a generic for typescript autocomplete to work on your remote
  - when you invoke an async function on a remote, under the hood, it's actually calling the async endpoint function, which may operate remote or local logic
  ```ts
  import {remote} from "renraku"

  const timing = remote<typeof timingApi>(endpoint)

  // calls like this magically work
  await timing.now()
  ```

### helper types

- **`fns`** — keeps you honest by ensuring your functions are async
  ```ts
  import {fns} from "renraku"

  const timingApi = fns({
    async now() {
      return Date.now()
    },
  })
  ```
- **`api`** — requires you to conform to the type that `expose` expects
  ```ts
  import {api} from "renraku"

  const timingApi = api(({headers}) => ({
    async now() {
      return Date.now()
    },
  }))
  ```

<br/>

## ⛩ *RENRAKU* — error handling

- you can throw an `ExposedError` in your async functions when you want the remote to see the error message:
  ```ts
  import {ExposedError, fns} from "renraku"

  const timingApi = fns({
    async now() {
      throw new ExposedError("not enough minerals")
        //                           ↑
        //                 publicly visible message
    },
  })
  ```
- any other kind of error will NOT send the message to the client
  ```ts
  import {fns} from "renraku"

  const timingApi = fns({
    async now() {
      throw new Error("insufficient vespene gas")
        //                           ↑
        // secret message is hidden from remote clients
    },
  })
  ```
- the intention here is security-by-default, because error messages could potentialy include sensitive information

<br/>

## ⛩ *RENRAKU* — logging
- renraku is silent by default
- on the server, you can use various callbacks to do your own logging
  ```ts
  import {exampleFns} from "./example.js"
  import {HttpServer, expose} from "renraku"

  const endpoint = expose(() => exampleFns, {

    // log when an error happens during an api invocation
    onError: (error, id, method) =>
      console.error(`!! ${id} ${method}()`, error),

    // log when an api invocation completes
    onInvocation: (request, response) =>
      console.log(`invocation: `, request, response),
  })

  const server = new HttpServer(endpoint, {

    // log when an error happens while processing a request
    onError: error =>
      console.error("bad request", error),
  })

  server.listen(8000)
  ```

<br/>

## ⛩ *RENRAKU* means *contact*

💖 free and open source just for you  
🌟 gimme a star on github  

