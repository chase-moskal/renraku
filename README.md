
# 連絡 <br/> ***R·E·N·R·A·K·U***

> ***"an api should just be a bunch of async functions, damn it"***
> &nbsp; &nbsp; — *Chase Moskal, many years ago*

💡 elegantly expose async functions as an api  
🔌 http, websockets, postmessage, and more  
🏛️ json-rpc 2.0  
🌐 node and browser  
🚚 transport agnostic toolkit  
🛡️ handy little auth helpers  
💻 *an https://e280.org/ project*  

i've been using and sharpening this typescript implementation for many years.

> ⚠️ ***IMPORTANT***  
> renraku is in the middle of an ongoing fat refactor!
> - [`renraku@0.5.0-11`](https://www.npmjs.com/package/renraku/v/0.5.0-11) is the most recent *stable* version, which has more features
> - `@e280/renraku@0.5.0-14` is the first of an *unstable* new line of wip development

<br/>

## ⛩️ *RENRAKU* http

1. install renraku into your project
    ```sh
    npm i @e280/renraku
    ```
1. `example.ts` — so you've got some async functions
    ```ts
    export const exampleFns = {

      async now() {
        return Date.now()
      },

      async add(a: number, b: number) {
        return a + b
      },

      nesty: {
        is: {
          besty: {
            async mul(a: number, b: number) {
              return a * b
            },
          },
        },
      },
    }
    ```
1. `server.ts` — expose 'em via http
    ```ts
    import {exampleFns} from "./example.js"
    import {httpServer} from "@e280/renraku/node"

    await httpServer({
      port: 8000,
      expose: () => exampleFns,
    })
    ```
1. `client.ts` — make a clientside remote
    ```ts
    import {httpRemote} from "@e280/renraku"
    import type {exampleFns} from "./example.js"
      //    ↑
      // we actually only need the *type* here

    const example = httpRemote<typeof exampleFns>({
      url: "http://localhost:8000/",
    })
    ```
    🪄 now you can magically call the functions on the clientside
    ```ts
    await example.now()
      // 1723701145176

    await example.add(2, 2)
      // 4

    await example.nesty.is.besty.mul(2, 3)
      // 6
    ```

> [!NOTE]
> for input validation, you should use [zod](https://github.com/colinhacks/zod) or something.

### http headers etc
- renraku provides the http stuff you need
  ```ts
  await httpServer({
    port: 8000,

      //       🆒   🆒   🆒
      //       ↓    ↓    ↓
    expose: ({req, ip, headers}) => exampleFns,
  })
  ```

### logging
- you can stick a `LoggerTap` into many things
  ```ts
  import {LoggerTap} from "@e280/renraku"
  ```
- use it to enable logging on the serverside
  ```ts
  await httpServer({
    port: 8000,
    expose: () => exampleFns,

    // ✅ logging enabled
    tap: new LoggerTap(),
  })
  ```
- use it to enable logging on the clientside
  ```ts
  const example = httpRemote<typeof exampleFns>({
    url: "http://localhost:8000/",

    // ✅ logging enabled
    tap: new LoggerTap(),
  })
  ```

### request limits
- `maxRequestBytes` prevents gigantic requests from dumping on you
  - `10_000_000` (10 megabytes) is the default
- `timeout` kills a request if it goes stale
  - `60_000` (60 seconds) is the default
- you could set these to `Infinity` if you've *lost your mind*

<br/>

## ⛩️ *RENRAKU* websockets

<br/>

## ⛩️ *RENRAKU* postmessage (popups, iframes, workers, etc)

<br/>

## ⛩️ *RENRAKU* core primitives

<br/>

## ⛩️ *RENRAKU* magic `tune` symbol

<br/>

## ⛩️ *RENRAKU* custom transports
- do you need renraku to operate over another medium, like carrier pigeons?
- well, you're in luck, because it's easy to setup your own transport medium
- so let's assume you have a group of async functions called `myFunctions`
- first, let's do your "serverside":
  ```ts
  import {endpoint} from "@e280/renraku"
  import {myFunctions} from "./my-functions.js"

  // create a renraku endpoint for your functions
  const myEndpoint = endpoint({fns: myFunctions})

  // create your wacky carrier pigeon server
  const pigeons = new CarrierPigeonServer({
    handleIncomingPigeon: async incoming => {

      // you parse your incoming string as json
      const request = JSON.parse(incoming)

      // execute the api call on your renraku endpoint
      const response = await myEndpoint(request)

      // you send back the json response as a string
      pigeons.send(JSON.stringify(response))
    },
  })
  ```
- second, let's do your "clientside":
  ```ts
  import {remote} from "@e280/renraku"
  import type {myFunctions} from "./my-functions.js"

  // create your wacky carrier pigeon client
  const pigeons = new CarrierPigeonClient()

  // create a remote with the type of your async functions
  const myRemote = remote<typeof myFunctions>({

    // your carrier pigeon implementation needs only to
    // transmit the json request object, and return then json response object
    endpoint: async request => await carrierPigeon.send(request)
  })

  // usage
  await myRemote.math.sum(1, 2) // 3
  ```

<br/>

## ⛩️ *RENRAKU* means *contact*

💖 free and open source just for you  
🌟 reward us with github stars  
💻 join us at [e280](https://e280.org/) if you're a real one  

