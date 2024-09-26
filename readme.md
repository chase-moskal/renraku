
# 連絡 <br/> ***R·E·N·R·A·K·U***

### 🎨 make beautiful typescript apis.

📦 **`npm i renraku`**  
💡 elegantly expose async functions as an api  
🌐 node and browser  
🏛️ json-rpc 2.0  
🔌 http, websockets, and more  
🚚 super transport agnostic  
🛡️ beautiful little auth helpers  

<br/>

### a simple idea

***"an api should just be a bunch of async functions, damn it"***

i had this idea in 2017, and have been evolving the implementation and typescript ergonomics ever since.

maybe this project is my life's work, actually...

<br/>

## *RENRAKU* — it's really this easy

1. install renraku into your project
    ```sh
    npm i renraku
    ```
1. so, you have a bunch of async functions
    ```ts
    // example.ts

    export const exampleFns = {

      async now() {
        return Date.now()
      },

      async sum(a: number, b: number) {
        return a + b
      },
    }
    ```
1. expose them on your server as a one-liner
    ```ts
    // server.ts

    import {exampleFns} from "./example.js"
    import {HttpServer, endpoint} from "renraku"

    new HttpServer(() => endpoint(exampleFns)).listen(8000)
    ```
1. on the client, another one-liner, and you can magically call those functions
    ```ts
    // client.ts

    import {httpRemote} from "renraku"
    import type {exampleFns} from "./example.js"
      //    ↑
      //    🆒 we only need the *type* here

    const example = httpRemote<typeof exampleFns>("http://localhost:8000/")

    // 🪄 you can now call the functions

    await example.now()
      // 1723701145176

    await example.sum(1, 2)
      // 3
    ```

<br/>

### arbitrary nesting is cool

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

## http headers etc

- renraku will provide the http stuff you need
  ```ts
    //              🆒  🆒    🆒
    //              ↓   ↓     ↓
  new HttpServer(({req, ip, headers}) => endpoint({

    async sum(a: number, b: number) {
      console.log(ip, headers["origin"])
      return a + b
    },
  })).listen(8000)
  ```

<br/>

## ⛩ *RENRAKU* — `secure` and `authorize`

- we have a lovely little auth system for you
- use the `secure` function to section off parts of your api that require auth
  ```ts
  import {secure} from "renraku"

  export const exampleFns = {

      // declaring this area requires auth
      //    |
      //    |   auth can be any type you want
      //    ↓                  ↓
    math: secure(async(auth: string) => {

      // here you can do any auth work you need
      if (auth !== "hello")
        throw new Error("auth error: did not receive warm greeting")

      return {
        async sum(a: number, b: number) {
          return a + b
        },
      }
    }),
  }
  ```
  - you see, `secure` merely adds your initial auth parameter as a required argument to each function
    ```ts
      //                  auth param
      //                      ↓
    await example.math.sum("hello", 1, 2)
    ```
- use the `authorize` function on the clientside to provide the auth param upfront
  ```ts
  import {authorize} from "renraku"

    //             (the secured area)  (async getter for auth param)
    //                          ↓              ↓
  const math = authorize(example.math, async() => "hello")
    // it's an async function so you could refresh
    // tokens or whatever

  // now the auth is magically provided for each call
  await math.sum(1, 2)
  ```
  - but why an async getter function?  
    ah, well that's because it's a perfect opportunity for you to refresh your tokens or what-have-you.  
    the getter is called for each api call.  

<br/>

## ⛩ *RENRAKU* — whimsical websockets

- here our example websocket setup is more complex because we're setting up two apis that can communicate bidirectionally.
- define your serverside and clientside apis
  ```ts
  // ws/apis.js

  // first, we must declare our api types.
  // (otherwise, typescript get a fit due to the mutual cross-referencing)

  export type Serverside = {
    sum(a: number, b: number): Promise<number>
  }

  export type Clientside = {
    now(): Promise<number>
  }

  // now we can define the api implementations.

  export const makeServerside = (
    clientside: Clientside): Serverside => ({

    async sum(a, b) {
      await clientside.now() // remember, each side can call the other
      return a + b
    },
  })

  export const makeClientside = (
    getServerside: () => Serverside): Clientside => ({

    async now() {
      return Date.now()
    },
  })
  ```
- on the serverside, we create a websocket server
  ```ts
  // ws/server.js

  import {WebSocketServer} from "renraku/x/node.js"
  import {Clientside, makeServerside} from "./apis.js"

  const server = new WebSocketServer({
    acceptConnection: ({remoteEndpoint, req, ip, headers}) => {
      const clientside = remote<Clientside>(remoteEndpoint)
      return {
        closed: () => {},
        localEndpoint: endpoint(makeServerside(clientside)),
      }
    },
  })

  server.listen(8000)
  ```
  - note that we have to import from `renraku/x/node.js`, because we keep all node imports separated to avoid making the browser upset
- on the clientside, we create a websocket remote
  ```ts
  // ws/client.js

  import {webSocketRemote, Api} from "renraku"
  import {Serverside, makeClientside} from "./apis.js"

  const [serverside, socket] = await webSocketRemote<Serverside>({
    url: "http://localhost:8000",
    getLocalEndpoint: serverside => endpoint(
      makeClientside(() => serverside)
    ),
  })

  const result = await serverside.now()
  ```

<br/>

## ⛩ *RENRAKU* — more about the core primitives

- **`endpoint`** — function to generate a json-rpc endpoint for a group of async functions
  ```ts
  import {endpoint} from "renraku"

  const myEndpoint = endpoint(myFunctions)
  ```
  - the endpoint is an async function that accepts a json-rpc request, calls the appropriate function, and then returns the result in a json-rpc response
  - basically, the endpoint's inputs and outputs can be serialized and sent over the network — this is the transport-agnostic aspect
- **`remote`** — function to generate a nested proxy tree of invokable functions
  - you need to provide the api type as a generic for typescript autocomplete to work on your remote
  - when you invoke an async function on a remote, under the hood, it's actually calling the async endpoint function, which may operate remote or local logic
  ```ts
  import {remote} from "renraku"

  const myRemote = remote<typeof myFunctions>(myEndpoint)

  // calls like this magically work
  await myRemote.now()
  ```
- **`fns`** — helper function to keeps you honest by ensuring your functions are async and return json-serializable data
  ```ts
  import {fns} from "renraku"

  const timingFns = fns({
    async now() {
      return Date.now()
    },
  })
  ```

<br/>

## ⛩ *RENRAKU* — simple error handling

- you can throw an `ExposedError` when you want the error message sent to the client
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
- the intention here is security-by-default, because error messages could potentially include sensitive information

<br/>

## ⛩ *RENRAKU* — request limits

- `maxRequestBytes` prevents gigantic requests from dumping on you
  - `10_000_000` (10 megabytes) is the default
- `timeout` kills a request if it goes stale
  - `10_000` (10 seconds) is the default
- set these on your HttpServer
  ```ts
  new HttpServer(() => endpoint(fns), {
    timeout: 10_000,
    maxRequestBytes: 10_000_000,
  })
  ```
- or set these on your WebSocketServer
  ```ts
  new WebSocketServer({
    timeout: 10_000,
    maxRequestBytes: 10_000_000,
    acceptConnection,
  })
  ```

<br/>

## ⛩ *RENRAKU* — logging
- renraku is silent by default
- on the server, you can use various callbacks to do your own logging
  ```ts
  import {exampleFns} from "./example.js"
  import {HttpServer, endpoint} from "renraku"

  const exampleEndpoint = endpoint(exampleFns, {

    // log when an error happens during an api invocation
    onError: (error, id, method) =>
      console.error(`!! ${id} ${method}()`, error),

    // log when an api invocation completes
    onInvocation: (request, response) =>
      console.log(`invocation: `, request, response),
  })

  const server = new HttpServer(() => exampleEndpoint, {

    // log when an error happens while processing a request
    onError: error =>
      console.error("bad request", error),
  })

  server.listen(8000)
  ```

<br/>

## ⛩ *RENRAKU* — go ahead and prematurely optimize with `notify` and `query`

json-rpc has two kinds of requests: "queries" expect a response, and "notifications" do not.  
renraku supports both of these.

don't worry about this stuff if you're just making an http api, this is more for realtime applications like websockets or postmessage for squeezing out a tiny bit more efficiency.

### let's start with a `remote`

```ts
import {remote, query, notify, settings} from "renraku"

const fns = remote(myEndpoint)
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

## ⛩ *RENRAKU* means *contact*

💖 free and open source just for you  
🌟 gimme a star on github  

