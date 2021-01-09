
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

🔆 **the elegant typescript api library**  
&nbsp; &nbsp; &nbsp; 🛎️ simple — expose async functions  
&nbsp; &nbsp; &nbsp; 🎭 shapeshifting remotes — client objects impersonate serverside api  
&nbsp; &nbsp; &nbsp; 🔒 flexible auth — set auth policies for each group of functions  
&nbsp; &nbsp; &nbsp; 🛠️ testability — pass remotes, real business objects, or mocks to clientside  
&nbsp; &nbsp; &nbsp; 🧠 sophisticated types — painstakingly engineered  
&nbsp; &nbsp; &nbsp; 🌐 compatible — exposes standard json rpc  

------
------

🔆 library for making elegant apis to power web apps  
&nbsp; &nbsp; &nbsp; 📡 typescript and node oriented  
&nbsp; &nbsp; &nbsp; 🌐 json rpc compliant for interop  

🧠 futuristic decoupled approach  
&nbsp; &nbsp; &nbsp; 🛎️ expose simple groups of async functions as api topics  
&nbsp; &nbsp; &nbsp; 🎭 shapeshifting api client objects, called "remotes", impersonate your exposed apis  
&nbsp; &nbsp; &nbsp; 🛠️ originally designed to be simple, now designed to be capable and complete  

🛡 auth processing and security policies  
&nbsp; &nbsp; &nbsp; 🔓 cors for public apis  
&nbsp; &nbsp; &nbsp; 🔒 easily customize auth processing  

🚧 **TODO**  
&nbsp; &nbsp; &nbsp; ⚠️ multiple apis per server, or alt auth for subtopics  
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ? server can host multiple apis  
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ? policies are defined by recursive structure  
&nbsp; &nbsp; &nbsp; ⚠️ simple node http server handles cors preflights  
&nbsp; &nbsp; &nbsp; ⚠️ prefab auth policy for simple cors origin whitelisting  
&nbsp; &nbsp; &nbsp; ⚠️ koa middleware  
&nbsp; &nbsp; &nbsp; ⚠️ express middleware  
&nbsp; &nbsp; &nbsp; ⚠️ working fullstack example  
&nbsp; &nbsp; &nbsp; ⚠️ complete tutorial: auth section, and promote decoupled architecture  

## ⛩️ RENRAKU LESSON ONE — MAKE A PUBLIC API, AND CALL IT

renraku tries to be as simple as possible. but no simpler.  
it's designed with auth in mind, but let's ignore that for now to keep our first examples simpler

&nbsp; **node api server**

- first, we formalize our api's business logic into "topics"  
  &nbsp; &nbsp; *~ make-math-topic.ts ~*
  ```ts
  import {asTopic} from "renraku/x/identities/as-topic.js"

   // formalized api topic allows us to leverage typescipt magic
   //          ↓                     ↓
  export const makeMathTopic = () => asTopic<{}>()({
   //                                        ↑  ↑
   // skipping auth rules for now, don't worry about it

     // you can group functions together arbitrarily, recursively
     //  ↓
    arithmetic: {

       // async functions will be exposed on the api
       //   ↓
      async sum(meta, x: number, y: number) {
       //       ↑
       // meta is reserved for auth stuff, ignore this for now

        return x + y
      }
    }
  })

   // provide easy access to the topic type
  export type MathTopic = ReturnType<typeof makeMathTopic>
  ```

- second, let's spool up a node server to expose the api  
  &nbsp; &nbsp; *~ node-server.ts ~*  
  ```ts
  import {makeJsonApi} from "renraku/x/api/make-json-api.js"
  import {makeHttpServerForApi} from "renraku/x/api/make-http-server-for-api.js"
  import {makeMathTopic} from "./make-math-topic.js"

   // generate an api function which exposes our api topic
  const api = makeJsonApi({
    expose: makeMathTopic()
  })

   // wrap our api in a standard node http server, and start listening
  makeHttpServerForApi(api).listen(5000)
  ```

&nbsp; **browser api remote**

- third, we generate an api client object we call a "remote"  
  &nbsp; &nbsp; *~ make-math-remote.ts ~*
  ```ts
  import {makeJsonRemoteForBrowser} from "renraku/x/remote/make-json-remote-for-browser.js"
  import {makeMathTopic, MathTopic} from "./make-math-topic.js"

  export const makeMathRemote = () => makeJsonRemoteForBrowser<{}, MathTopic>({

     // we provide the url to our node api server
    link: "http://localhost:5000/",

     // we have to describe the 'shape' of the topic.
     // typescript enforces that this matches exactly
    shape: {arithmetic: {sum: true}},

     // here's where you'd supply custom headers
     // to send with each request
    headers: {},

     // auth processing that we're ignoring for now
    getAuth: async() => ({}),
  })
  ```

- now, you can grab a remote on the frontend, and call your functions fluently  
  &nbsp; &nbsp; *~ my-frontend-system.ts ~*
  ```ts
  import {makeMathRemote} from "./make-math-remote.js"

  async function main() {

     // make the math remote and grab the arithmetic subtopic
    const {arithmetic} = makeMathRemote()

     // perform api calls fluently
    const result1 = await arithmetic.sum(1, 1)
    const result2 = await arithmetic.sum(2, 3)

    console.log(result1) //> 2
    console.log(result2) //> 5
  }
  ```

📖 **terminology review**
- `topic` — business logic functions. organized into objects, recursive
- `api` — a function which executes the business logic in a topic
- `server` — an http server which executes api functions
- `shape` — json data structure that describes a topic's surface area
- `remote` — a clientside proxy that mimics the shape of a topic, makes http calls

## ⛩️ RENRAKU LESSON TWO — API WITH AUTHENTICATION AND AUTHORIZATION

now we're going to improve the first examples by adding auth

we'll also add some more functions to show off some more capabilities

- so let's make a better version of our topic  
  &nbsp; &nbsp; *~ make-math-topic.ts ~*
  ```ts
  import {asTopic} from "renraku/x/identities/as-topic.js"

  export const makeMathTopic2 = () => asTopic({
    expose: {
      arithmetic: {
        [policy]: {
          parseRequest: async() => {},
          processAuth: async() => {},
        },
        async sum(meta, x: number, y: number) {
          return x + y
        },
      },
    },
  })

  export const makeMathTopic = () => asTopic<{}>()({
    arithmetic: {

      async sum(meta, x: number, y: number) {
        return x + y
      },

      async average(meta, ...points: number[]) {
        if (points.length === 0) throw new ApiError("cannot average nothing")
        let total = 0
        for (const point of points) total += point
        return total / points.length
      },
    }
  })

   // provide easy access to the topic type
  export type MathTopic = ReturnType<typeof makeMathTopic>
  ```


*todo: coming soon*

&nbsp; &nbsp; &nbsp; &nbsp; *— RENRAKU means "contact" —*
