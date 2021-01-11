
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

`npm install renraku`

**🔆 enlightened typescript api library**  
&nbsp; &nbsp; 🛎️ simple — expose async functions  
&nbsp; &nbsp; 🎭 shapeshifting — client objects impersonate serverside api  
&nbsp; &nbsp; 🛡 flexible auth — set auth policies for each group of functions  
&nbsp; &nbsp; 🔧 testability — run your functions anywhere for testing or dev  
&nbsp; &nbsp; 🧠 sophisticated types — painstakingly engineered for integrity  
&nbsp; &nbsp; 🌐 compatible — exposes standard json rpc  
&nbsp; &nbsp; ⚠️ experimental — live on the edge  

## ⛩️ RENRAKU STEP-BY-STEP

> you can skip this tutorial and just read the working [s/example/](s/example/) code (which is used for testing purposes, so mind the relative import paths)  

1. **let's build a really simple api together.**  
    we'll integrate auth like it's a real app,  
    run a node server, and call it from the browser  

1. **we'll start with two functions**
    ```typescript
    export async function sayHello(name: string) {
      return `Hello ${name}, welcome!`
    }

    export async function sayGoodbye(name: string) {
      return `Goodbye ${name}, see you later.`
    }
    ```
    this will soon become our api

1. **now let's spice that up with some auth**
    ```typescript
    export interface ExampleAuth {
      doctorate: boolean
    }

    export async function sayHello(auth: ExampleAuth, name: string) {
      if (auth.doctorate) return `Hello Dr. ${name}, welcome!`
      else return `Hello ${name}, welcome!`
    }

    export async function sayGoodbye(auth: ExampleAuth, name: string) {
      if (auth.doctorate) return `Goodbye Dr. ${name}, see you later.`
      else return `Goodbye ${name}, see you later.`
    }
    ```
    now we're greeting users who have a doctorate differently than otherwise

    these functions are now properly conforming renraku procedures
    - all renraku functions must always accept a first argument called `auth`
    - the auth argument is reserved for processed auth data (usually a user's details and privileges)

1. **we formalize those functions into a renraku "topic"**
    ```typescript
    import {asTopic} from "renraku/x/identities/as-topic.js"

    export interface ExampleAuth {
      doctorate: boolean
    }

    export const greeter = asTopic<ExampleAuth>()({
     //                                              ↑
     //                ⚠️ curried for magical typescript inference ⚠️

      async sayHello(auth, name: string) {
        if (auth.doctorate) return `Hello Dr. ${name}, welcome!`
        else return `Hello ${name}, welcome!`
      },

      async sayGoodbye(auth, name: string) {
        if (auth.doctorate) return `Goodbye Dr. ${name}, see you later.`
        else return `Goodbye ${name}, see you later.`
      },
    })
    ```
    we named this topic "greeter"
    - every function in the same renraku topic must share the same `auth` type.  
    - some renraku library functions, like `asTopic`, are curried up and you have to invoke them twice, like `asTopic()(topic)`.  
      it looks weird, but you desparately want this: it circumvents a typescript limitation, allowing you to specify your `auth` type *while* also allowing your topic type to be inferred (so you can avoid maintaining a separate interface for your topic)
    - and if you like, you can group your topic functions into arbitrarily-nested objects, like this
        ```typescript
        const greeter = asTopic<ExampleAuth>()({
          async sayBoo(auth) {return "BOO!"},
          nestedGroupA: {
            nestedGroupB: {
              async sayYolo(auth) {return "#YOLO"},
            }
          }
        })
        ```

1. **we assemble topics into an api object**
    ```typescript
    import {apiContext} from "renraku/x/api/api-context.js"
    import {asApi} from "renraku/x/identities/as-api.js"

    export interface ExampleMeta {
      token: string
    }

    export const exampleApi = () => asApi({
      greeter: apiContext<ExampleMeta, ExampleAuth>()({
        expose: greeter,
        policy: {processAuth: async meta => ({doctorate: meta.token === "abc"})},
      })
    })
    ```
    an api contains api contexts
    - an api context contains a topic and the `policy` which processes the auth for that topic
    - our example `processAuth` is stupid-simple: if the token is "abc", the user has a doctorate.  
      of course in a real app, this is where we might do token verification, and query our database about the user and whatnot
    - and yes, you can group your api-contexts into arbitrarily-nested objects
    - however you cannot nest a context under another context (so that auth policies cannot conflict)

1. **we expose the api on a nodejs server**
    ```typescript
    import {makeJsonHttpServelet} from "renraku/x/servelet/make-json-http-servelet.js"
    import {makeNodeHttpServer} from "renraku/x/server/make-node-http-server.js"

    const servelet = makeJsonHttpServelet(exampleApi())
    const server = makeNodeHttpServer(servelet)
    server.listen(8001)
    ```
    now our server is up and running
    - the `servelet` simply accepts requests and returns responses.  
      it runs the auth processing and executes the appropriate topic function
    - then we make and start a standard node http server with the servelet

1. **clientside: we define a shape object for our api**
    ```typescript
    import {asShape} from "renraku/x/identities/as-shape.js"
    import {_augment} from "renraku/x/types/symbols/augment-symbol.js"

    export const exampleShape = asShape<ReturnType<typeof exampleApi>>({
      greeter: {
        [_augment]: {getMeta: async() => ({token: "abc"})},
        sayHello: true,
        sayGoodbye: true,
      }
    })
    ```
    the shape outlines your api and auth `meta` data for each topic
    - typescript will enforce that the shape matches your topic exactly
    - each topic must be given an `_augment` object with a `getMeta` function.  
      this specifies what meta data will be sent with each request to the topic
    - this runtime shape object is vital for generating remotes

1. **clientside: we generate a remote, and start calling functions from the browser**
    ```typescript
    import {generateJsonBrowserRemote} from "renraku/x/remote/generate-json-browser-remote.js"
    void async function main() {

      const {greeter} = generateJsonBrowserRemote({
        headers: {},
        shape: exampleShape,
        link: "http://localhost:8001",
      })

      // execute an http json remote procedure call
      const result1 = await greeter.sayHello("Chase")
      const result2 = await greeter.sayGoodbye("Moskal")

      console.log(result1) // "Hello Dr. Chase, welcome!"
      console.log(result2) // "Goodbye Dr. Moskal, see you later."
    }()
    ```

## ⛩️ RENRAKU ERROR HANDLING

- thrown exceptions will trigger exceptions on the clientside
- if you throw a renraku `ApiError`, the message and the http status code will be sent to the client
    ```typescript
    import {ApiError} from "renraku/x/api/api-error.js"

    // later, somewhere in your topic functionality
    throw new ApiError(403, "forbidden; user must be qualified with a doctorate")
    ```
- for all other thrown exceptions, the details are censored from the client, and a generic 500 ApiError is sent instead

## ⛩️ RENRAKU FOR DEVELOPMENT AND TESTING

- **curry a topic for direct usage**
    ```typescript
    import {asTopic} from "renraku/x/identities/as-topic.js"
    import {curryTopic} from "renraku/x/curry/curry-topic.js"

    interface ExampleAuth {
      doctorate: boolean
    }

    const greeter = asTopic<ExampleAuth>()({
      async sayHello(auth, name: string) {
        if (auth.doctorate) return `Hello Dr. ${name}, welcome!`
        else return `Hello ${name}, welcome!`
      }
    })

    // now we can curry the topic for local usage
    // we specify the auth provided with each call
    const greeterWithAuth = curryTopic<ExampleAuth>()({
      topic: greeter,
      getAuth: async() => ({doctorate: true}),
    })

    // now we can call functions, and the auth is baked-in
    void async function main() {
      const result = await greeterWithAuth.sayHello("Chase")
      console.log(result) // "Hello Dr. Chase, welcome!"
    }()
    ```
    - this is useful for running simple tests

- **full loopback for full-stack testing**
    ```typescript
    // spin up the servelet on the clientside
    // (servelet is normally on the serverside)
    const servelet = makeJsonHttpServelet(exampleApi())

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

    console.log(result1) // "Hello Dr. Chase, welcome!"
    console.log(result2) // "Goodbye Dr. Moskal, see you later."
    ```
    - this fully excercises all facilities, clientside and serverside, emulating http transactions, and running your auth processing — all without any real network activity

## 📖 RENRAKU TERMINOLOGY

- `topic` — business logic functions. organized into objects, recursive
- `meta` — data sent with each request
- `auth` — processed auth data, passed to each business function
- `api` — server definition containing topics. is a recursive collection of api contexts
- `api-context` — binds a topic together with an auth policy
- `policy` — defines how meta data is processed into auth data by the serverside
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
