
# 連絡 <br/>  ***R·E·N·R·A·K·U***

> `npm install renraku`

📡 **make beautiful typescript apis**  
🛎️ simply expose async functions  
🛡️ elegant auth facilities  
🚚 transport agnostic *(http and websockets)*  
🏛️ bog-standard json-rpc  
🔧 node and browser  
🎭 easily testable  

### make beautiful typescript apis.

*RENRAKU* makes interacting with remote apis feel the same as interacting with local async functions.. the goal is to provide you with a "remote" on which you can just call ordinary async functions, and you don't need to care whether it's over http, or a websocket, or is happening locally.

<br/>

## ⛩️ *RENRAKU* — http api

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

## ⛩ *RENRAKU* — more api details

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
  import {api, requireAuth} from "renraku"

  export const myApi = api(() => ({
    locked: requireAuth(async(auth: string) => {

      if (auth !== "hello")
        throw new Error("failed fake authentication lol")

      return {
        async sum(a: number, b: number) {
          return a + b
        },
      }
    }),
  }))
  ```
- now on the clientside, the auth param is required
  ```ts
  import type {myApi} from "./api.js"
  import {httpRemote, provideAuth} from "renraku"

  const service = httpRemote<typeof myApi>("http://localhost:8000/")

  // so auth "hello" is required as a parameter
  await service.locked.sum("hello", 1, 2)

  // or you can provide auth to a group of functions
  const locked = provideAuth("hello", service.locked)
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

