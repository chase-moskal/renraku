
# 連絡 <br/> ***R·E·N·R·A·K·U***

### 🎨 make beautiful typescript apis.

📦 **`npm i renraku`**  
💡 elegantly expose async functions  
🌐 node and browser  
🏛️ bog-standard json-rpc 2.0  
🔌 http and websockets  
🚚 transport agnostic core  
🛡️ auth helpers  
🧪 testable  

RENRAKU makes interacting with remote apis feel the same as interacting with local async functions.

<br/>

## ⛩️ *RENRAKU* — make a happy http api

1. install renraku into your project
    ```sh
    npm i renraku
    ```
1. `api.ts` — define your api, a bunch of async functions
    ```ts
    import {api} from "renraku"

    export const myApi = api(() => ({

      async now() {
        return Date.now()
      },

      async sum(a: number, b: number) {
        return a + b
      },
    }))
    ```
1. `server.ts` — now let's expose this api on a node server
    ```ts
    import {myApi} from "./api.js"
    import {HttpServer, expose} from "renraku"

    const server = new HttpServer(expose(myApi))

    server.listen(8000)
    ```
1. `client.ts` — finally, let's call this from a web browser
    ```ts
    import type {myApi} from "./api.js"
    import {httpRemote} from "renraku"

    const service = httpRemote<typeof myApi>("http://localhost:8000/")

    // call your remote api functions just like they were local

    await service.now()
      // 1723701145176

    await service.sum(1, 2)
      // 3
    ```

<br/>

## ⛩ *RENRAKU* — details you should know about `api`

- you can use arbitrary object nesting to organize your api
  ```ts
  export const myApi = api(() => ({

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
  }))
  ```
- your api can accept http headers
  ```ts
    //                   http headers
    //                        |
  export const myApi = api(({headers}) => ({
    async sum(a: number, b: number) {
      return a + b
    },
  }))
  ```

<br/>

## ⛩ *RENRAKU* — auth is easy

- declare that parts of your api requires auth
  ```ts
  import {api, secure} from "renraku"

  export const myApi = api(() => ({

      //    declaring this area to require auth
      //         |
      //         |        can be any type you want
      //         |                   |
    locked: secure(async(auth: string) => {

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
  }))
  ```
- now on the clientside, the `auth` param is required
  ```ts
  import type {myApi} from "./api.js"
  import {httpRemote, authorize} from "renraku"

  const service = httpRemote<typeof myApi>("http://localhost:8000/")

  // you can provide the 'auth' as the first parameter
  await service.locked.sum("hello", 1, 2)

  // or authorize a whole group of functions
  const locked = authorize(service.locked, async() => "hello")
    // it's an async function so you could refresh
    // tokens or whatever

  // this call has been authorized
  await locked.sum(1, 2)
  ```

<br/>

## ⛩ *RENRAKU* — bidirectional websockets

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
    return api((): Serverside => ({
      async sum(a, b) {

        // remember, each side can call the other
        await clientside.now()

        return a + b
      },
    }))
  }

  export function makeClientsideApi(serverside: Serverside) {
    return api((): Clientside => ({
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

## ⛩ *RENRAKU* — more details about the core primitives

- about the basics
  ```ts
  import {api, expose, remote} from "renraku"

  // an api is a function that returns a bunch of async functions
  const myApi = api(({headers}) => ({
    async now() {
      return Date.now()
    },
  }))

  // expose will create an async endpoint function,
  // which accepts json-rpc requests and returns json-rpc responses
  const myEndpoint = expose(myApi)

  // you can create a remote given any endpoint,
  // and it doesn't matter if the endpoint is actually local or remote.
  const myRemote = remote(myEndpoint)
  ```
- ***experimental*** "notification" mode
  - a `query` is a request which elicits a response.
    - this is the default.
  - a `notification` is a request which does not get a response.
    - this might help you make your apis marginally more efficient.
    - now let's show you how to designate certain functions as notifications
  - because of the way the json-rpc spec is designed, the requester actually decides whether they send a query or a notification -- so this behavior is not something the server decides -- and thus, it's a setting for our remote
  ```ts
  import {remote, settings} from "renraku"

  const fns = remote(endpoint)

  // so here's an ordinary query
  await fns.hello.world()

  // and now we change the setting
  fns.hello.world[settings].notification = true

  // from now on, this function operates as a notification
  await fns.hello.world()
  ```
  - alternatively, you can set the whole remote to notifications-by-default like this:
  ```ts
  const fns = remote(endpoint, {notification: true})
  ```

