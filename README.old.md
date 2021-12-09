
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

`npm install renraku`

**🔆 enlightened typescript api library**  
&nbsp; &nbsp; 🛎️ simple — expose async functions  
&nbsp; &nbsp; 🎭 shapeshifting — client objects impersonate serverside api  
&nbsp; &nbsp; 🛡 flexible auth — set auth policies for each group of functions  
&nbsp; &nbsp; 🔧 testability — run your api anywhere for testing or dev  
&nbsp; &nbsp; 🧠 sophisticated types — painstakingly engineered for integrity  
&nbsp; &nbsp; 🌐 compatible — exposes standard json rpc  
&nbsp; &nbsp; ⚠️ experimental — live on the edge  

<br/>

## ⛩️ RENRAKU STEP-BY-STEP

> you can skip this tutorial and just read the working [s/example/](s/example/) code (which is used for testing purposes, so mind the relative import paths)  

1. **let's build a really simple api together.**
    - we'll integrate auth, like it's a real app
    - and we'll run it in a node server, and call it from the browser

1. **we'll start with two functions**
    ```typescript
    export async function sayHello(name: string) {
      return `Hello ${name}, welcome!`
    }

    export async function sayGoodbye(name: string) {
      return `Goodbye ${name}, see you later.`
    }
    ```
    this is the starting point for our api

1. **let's rewrite that to add some auth**  
    let's greet users who have a doctorate differently
    ```typescript
    export interface ExampleAuth {
      doctorate: boolean
    }

    export async function sayHello(auth: ExampleAuth, name: string) {
      return auth.doctorate
        ? `Hello Dr ${name}, welcome!`
        : `Hi ${name}, what's up?`
    }

    export async function sayGoodbye(auth: ExampleAuth, name: string) {
      return auth.doctorate
        ? `Goodbye Dr ${name}, see you again soon`
        : `Cya later ${name}`
    }
    ```
    these functions are now renraku procedures
    - renraku procedures must always accept a first argument called `auth`
    - you'll probably use the auth arguments for user details and privileges

1. **let's rewrite that to make it a renraku "api context"**
    ```typescript
    import {apiContext} from "renraku/x/api/api-context.js"

    export interface ExampleMeta {
      token: string
    }

    export interface ExampleAuth {
      doctorate: boolean
    }

    export const greeter = apiContext<ExampleMeta, ExampleApi>()({
     //                                                        ↑
     //                                            ⚠️ notice subtlety ⚠️
     //                         curried for magical typescript inference

      policy: async(meta, request) => ({
        doctorate: meta.token === "yes-has-doctorate"
      })

      expose: {
        async sayHello(auth, name: string) {
          return auth.doctorate
            ? `Hello Dr ${name}, welcome!`
            : `Hi ${name}, what's up?`
        },

        async sayGoodbye(auth, name: string) {
          return auth.doctorate
            ? `Goodbye Dr ${name}, see you again soon`
            : `Cya later ${name}`
        },
      },
    })
    ```
    this api context is called "greeter"
    - the `ExampleMeta` is data the client sends with each request
    - the `policy` function processes the meta to create the auth object. our example is a very simple policy, if the token equals `"yes-has-doctorate"`, then `auth.doctorate` is true
    - the `expose` object contains our client-callable api functions
    - ⚠️ some renraku library functions, like `apiContext`, are curried up and you have to invoke them carefully, like `apiContext()(context)`.  
      it looks weird, but it's important: it circumvents a typescript limitation, and allows you to specify your `auth` type *while* also allowing your function types to be inferred (so you can avoid maintaining a separate interface for your functions)
    - if you like, you can group your topic functions into arbitrarily-nested objects, like this
        ```typescript
        ({
          expose: {
            sayBoo(auth) {return "boo!"},
            countries: {
              canada: {
                async getGourmet(auth) {return "timmies"},
              },
            },
          },
        })
        ```
    okay, we can save the above file as `greeter.ts`

1. **now we assemble our greeter into an api object, and a shape object**
    ```typescript
    import {greeter} from "./greeter.js"
    import {asApi} from "renraku/x/identities/as-api.js"
    import {apiContext} from "renraku/x/api/api-context.js"
    import {asShape} from "renraku/x/identities/as-shape.js"
    import {_meta} from "renraku/x/types/symbols/meta-symbol.js"

    export const exampleApi = asApi({greeter})

    export const exampleShape = (token: string) =>
      asShape<typeof exampleApi>({
        greeter: {
          [_meta]: async() => ({token}),
          sayHello: true,
          sayGoodbye: true,
        },
      })
    ```
    about the api object
    - an api object can contain many contexts, which can have different auth policies
    - and yes, you can use arbitrarily-nested objects as groupings in your api object
    about the shape object
    - the shape object is for the clientside
    - it seems weird, but this is what outlines to the client what functions are callable
    - it's also where you specify what meta object is sent with each client request
    - don't worry, typescript will complain whenever your shape doesn't match your functions
    we save this as `example-api.ts`

1. **serverside: we expose the api on a nodejs server**
    ```typescript
    import {exampleApi} from "./example-api.js"
    import {makeNodeHttpServer} from "renraku/x/server/make-node-http-server.js"
    import {makeJsonHttpServelet} from "renraku/x/servelet/make-json-http-servelet.js"

    const servelet = makeJsonHttpServelet(exampleApi)
    const server = makeNodeHttpServer(servelet)
    server.listen(8001)
    ```
    now our server is up and running
    - the `servelet` simply accepts requests and returns responses.  
      it runs the auth processing and executes the appropriate function
    - then we make and start a standard node http server with the servelet

1. **clientside: we generate the remote, and start calling functions from the browser**
    ```typescript
    import {exampleShape} from "./example-api.js"
    import {generateJsonBrowserRemote} from "renraku/x/remote/generate-json-browser-remote.js"
    void async function main() {
      const token = "yes-has-doctorate"

      const {greeter} = generateJsonBrowserRemote({
        headers: {},
        shape: exampleShape(token),
        link: "http://localhost:8001",
      })

      // call the functions, remotely!
      const result1 = await greeter.sayHello("Chase")
      const result2 = await greeter.sayGoodbye("Chase")

      console.log(result1) // Hello Dr Chase, welcome!
      console.log(result2) // Goodbye Dr Chase, see you again soon
    }()
    ```

<br/>

## ⛩️ RENRAKU FOR ARCHITECTURE, DEVELOPMENT, AND TESTING

- **your frontend systems should expect to use 'remotes'**  
    the remote can point to a real server, or actually be a clientside loopback
    ```typescript
    import {greeter} from "./greeter.js"
    import {Remote} from "renraku/x/types/remote/remote.js"
    async function myFrontendSystem(
        greeter: Remote<typeof greeter>
      ) {
      const result = greeter.sayHello("Chase")
      console.log(result)
    }
    ```

- **genius-level full loopback for full-stack testing and development**
    ```typescript
    import {exampleApi, exampleShape} from "./example-api.js"
    import {loopbackJsonRemote} from "renraku/x/remote/loopback-json-remote.js"

    // spin up the servelet on the clientside
    // (servelet is normally on the serverside, but not today!)
    const servelet = makeJsonHttpServelet(exampleApi)

    // generate a "loopback" remote which directly calls the servelet
    // instead of any network activity
    const {greeter} = loopbackJsonRemote({
      servelet,
      shape: exampleShape,
      link: "http://localhost:8001",
    })

    // execute locally, no network activity
    const result1 = await greeter.sayHello("Chase")
    const result2 = await greeter.sayGoodbye("Moskal")
    ```
    - a loopback allows you to fully excercise all facilities, clientside and serverside, emulating http transactions, and running your auth processing — all without any real network activity

<br/>

## ⛩️ RENRAKU ERROR HANDLING

- serverside exceptions will trigger exceptions on the clientside
- if you throw a renraku `ApiError`, the message and the http status code will be sent to the client
    ```typescript
    import {ApiError} from "renraku/x/api/api-error.js"

    throw new ApiError(403, "forbidden; user must be qualified with a doctorate")
    ```
- for all other thrown exceptions, the message and details are censored from the client, and a generic 500 ApiError is sent instead

<br/>

## 📖 RENRAKU TERMINOLOGY

- `meta` — data sent with each request
- `auth` — processed auth data, passed to each business function
- `api` — server definition containing topics. is a recursive collection of api contexts
- `topic` — business logic functions to be exposed
- `policy` — defines how meta data is processed into auth data by the serverside
- `api-context` — a topic and associated auth policy prepared to be assembled in an api object
- `servelet` — a function which executes an api, accepts a request and returns a response
- `shape` — data structure describes an api's surface area and meta augmentations
- `augment` — defines how the client sends meta data with requests
- `remote` — a clientside proxy that mimics the shape of an api, whose functions execute remote calls

<br/>

------

## ⛩️ RENRAKU WANTS YOU

contributions welcome

please consider posting an issue for any problems, questions, or comments you may have

and give me your github stars!  
&nbsp; // chase

------

&nbsp; &nbsp; &nbsp; *— RENRAKU means "contact" —*  
