
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

**🔆 the enlightened typescript api library**  
&nbsp; &nbsp; 🛎️ simple — expose async functions  
&nbsp; &nbsp; 🎭 shapeshifting — client objects impersonate serverside api  
&nbsp; &nbsp; 🛡 flexible auth — set auth policies for each group of functions  
&nbsp; &nbsp; 🛠 testability — run your business logic on the client during dev  
&nbsp; &nbsp; 🧠 sophisticated types — painstakingly engineered for integrity  
&nbsp; &nbsp; 🌐 compatible — exposes standard json rpc  
&nbsp; &nbsp; ⚠️ experimental — live on the edge  

## 🚧 RENRAKU DEV TODO

- new names for 'auth' and 'meta', maybe just swap
- rename 'api-group' to just 'api'
- curry meta function for simpler testing without full loopback
- write readme section about testing/development scenarios

## ⛩️ RENRAKU STEP-BY-STEP

> you can skip this tutorial and just read the working [s/example/](s/example/) code (which is used for testing purposes, so mind the relative import paths)  

1. **let's build a really simple api together,**  
    and we'll integrate auth like it's a real app,  
    and call its functions from the browser  

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
    export interface ExampleMeta {
      doctorate: boolean
    }

    export async function sayHello(meta: ExampleMeta, name: string) {
      if (meta.doctorate) return `Hello Dr. ${name}, welcome!`
      else return `Hello ${name}, welcome!`
    }

    export async function sayGoodbye(meta: ExampleMeta, name: string) {
      if (meta.doctorate) return `Goodbye Dr. ${name}, see you later.`
      else return `Goodbye ${name}, see you later.`
    }
    ```
    now we're greeting users who have a doctorate differently than otherwise

    these functions are now properly conforming renraku procedures
    - all renraku functions must always accept a first argument called `meta`
    - the meta argument is reserved for processed auth data (usually a user's details and privileges)

1. **we formalize those functions into a renraku "topic"**
    ```typescript
    import {asTopic} from "renraku/x/identities/as-topic.js"

    export interface ExampleMeta {
      doctorate: boolean
    }

    export const greeterTopic = asTopic<ExampleMeta>()({
     //                                              ↑
     //                ⚠️ curried for magical typescript inference ⚠️

      async sayHello(meta, name: string) {
        if (meta.doctorate) return `Hello Dr. ${name}, welcome!`
        else return `Hello ${name}, welcome!`
      },

      async sayGoodbye(meta, name: string) {
        if (meta.doctorate) return `Goodbye Dr. ${name}, see you later.`
        else return `Goodbye ${name}, see you later.`
      },
    })
    ```
    we named this topic "greeter"
    - every function in the same renraku topic must share the same `meta` type.  
    - some renraku library functions, like `asTopic`, are curried up and you have to invoke them twice, like `asTopic()(topic)`.  
      it looks weird, but you desparately want this: it circumvents a typescript limitation, allowing you to specify your `meta` type *while* also allowing your topic type to be inferred (so you can avoid maintaining a separate interface for your topic)
    - and if you like, you can group your topic functions into arbitrarily-nested objects, like this
        ```typescript
        const greeter = asTopic<ExampleMeta>()({
          async sayBoo(meta) {return "BOO!"},
          nestedGroupA: {
            nestedGroupB: {
              async sayYolo(meta) {return "#YOLO"},
            }
          }
        })
        ```

1. **we assemble topics into an api object**
    ```typescript
    import {apiContext} from "renraku/x/api/api-context.js"
    import {asApiGroup} from "renraku/x/identities/as-api-group.js"

    export interface ExampleAuth {
      token: string
    }

    export const exampleApi = () => asApiGroup({
      greeter: apiContext<ExampleAuth, ExampleMeta>()({
        expose: greeterTopic,
        policy: {processAuth: async auth => ({doctorate: auth.token === "abc"})},
      })
    })
    ```
    an api contains api contexts
    - an api context contains a topic and the `policy` which processes the auth for that topic
    - our example `processAuth` is stupid-simple: if the token is "abc", the user has a doctorate.  
      of course in a real app, this is where we might do token verification, and query our database about the user and whatnot
    - and yes, you can group your api-contexts into arbitrarily-nested objects
    - but you cannot nest a context under another context (so that auth policies cannot conflict)

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
        [_augment]: {getAuth: async() => ({token: "abc"})},
        sayHello: true,
        sayGoodbye: true,
      }
    })
    ```
    the shape outlines your api and auth data for each topic
    - typescript will enforce that the shape matches your topic exactly
    - each topic must be given an `_augment` object with a `getAuth` function.  
      this specifies what auth data will be sent with each request to the topic
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

- *...explanations coming soon...*

## ⛩️ RENRAKU FOR DEVELOPMENT AND TESTING

- *...explanations coming soon...*

## 📖 RENRAKU TERMINOLOGY

- `topic` — business logic functions. organized into objects, recursive
- `api-context` — binds a topic together with an auth policy
- `api` — recursive collection of api contexts
- `policy` — defines how auth data is processed by the serverside
- `servelet` — a function which executes an api, accepts a request and returns a response
- `shape` — data structure describes an api's surface area and auth augmentations
- `augment` — defines how the client sends auth data with requests
- `remote` — a clientside proxy that mimics the shape of an api, whose functions execute remote calls

------

## ⛩️ RENRAKU WANTS YOU

contributions welcome

please consider posting an issue for any problems, questions, or comments you may have

and give me your github stars!  
&nbsp; // chase

------

&nbsp; &nbsp; &nbsp; *— RENRAKU means "contact" —*  
