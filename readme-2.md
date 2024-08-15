
# 連絡 <br/> ⛩ ***R·E·N·R·A·K·U***

> `npm install renraku`

📡 **make beautiful typescript apis**  
🛎️ simply expose async functions  
🛡️ elegant auth facilities  
🚚 transport agnostic *(http and websockets)*  
🔧 node and browser  
🎭 easily testable  

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

## ⛩ *RENRAKU* — api details

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

## ⛩ *RENRAKU* — makes auth easy

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

