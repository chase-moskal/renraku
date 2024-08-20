
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

  export function makeClientsideApi(serverside: Serverside) {
    return api<Clientside>(() => ({
      async now() {
        return Date.now()
      },
    }))
  }
  ```
- `ws/server.js` — on the serverside, we create a websocket server
  ```ts
  import {WebSocketServer} from "renraku"
  import {Clientside, makeServersideApi} from "./apis.js"

  const server = new WebSocketServer({
    acceptConnection: ({remoteEndpoint}) => {
      const clientside = remote<Api<Clientside>>(remoteEndpoint)
      return {
        closed: () => {},
        localEndpoint: expose(makeServersideApi(clientside)),
      }
    },
  })

  server.listen(8000)
  ```
- `ws/client.js` — on the clientside, we create a websocket remote
  ```ts
  import {webSocketRemote, Api} from "renraku"
  import {Serverside, makeClientsideApi} from "./apis.js"

  const {socket, remote: serverside} = await webSocketRemote<Api<Serverside>>({
    url: "http://localhost:8000",
    getLocalEndpoint: serverside => expose(
      makeClientsideApi(serverside)
    ),
  })

  const result = await serverside.now()
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

### experimental details

- **`notification`**
  - a `query` is a request which elicits a response
    - this is the default
  - a `notification` is a request which does not want a response
    - this might help you make your apis marginally more efficient
    - you can designate certain remote functions as notifications
  - because of the way the json-rpc spec is designed, the requester actually decides whether they send a query or a notification -- so this behavior is not something the server decides -- and thus, it's a setting for our remote
  ```ts
  import {remote, settings} from "renraku"

  const fns = remote(endpoint)

  // so here's an ordinary query
  await fns.hello.world()

  // and now we change the setting for this function
  fns.hello.world[settings].notification = true

  // from now on, this function operates as a notification
  await fns.hello.world()
  ```
  - alternatively, you can set the whole remote to notifications-by-default like this:
  ```ts
  const fns = remote(endpoint, {notification: true})
  ```

<br/>

## ⛩ *RENRAKU* means *contact*

💖 free and open source just for you  
🌟 gimme a star on github  

