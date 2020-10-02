
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

🔆 typescript api library of the future  
&nbsp; &nbsp; 🌐 elegantly make or use json rpc api's  
&nbsp; &nbsp; 📡 isomorphic client works in node and browsers  

🧠 genius-level approach decoupling architecture  
&nbsp; &nbsp; 🛎️ expose async functions on json rpc endpoints  
&nbsp; &nbsp; 🎭 shapeshifting api clients match implementations  
&nbsp; &nbsp; 🛠️ advanced curries for auth and more  

🛡 straightforward security model  
&nbsp; &nbsp; 🔓 cors rules for public endpoints  
&nbsp; &nbsp; 🔒 public key whitelist for signed requests  

## *RENRAKU* school on web api practices

- renraku began with the principal: *"a good api library should simply disappear".* api libraries should abstract away the api details to such a degree that calling remote methods looks the same as calling local methods
- i will try to explain renraku by sharing the lessons i've learned while developing and using renraku privately for years

### ⛩️ lesson one: don't make calls directly.. grow up!

- traditionally to call an api, you'll often find a nasty old pattern along these lines:
  ```js
  // ugly and bad: don't make direct api calls like this
  const details = await api.apiCall("userTopic.getDetails", userId)
   //                        ↑             ↑
   //    [library coupling, gross!]   [string literal, yuck!]
  ```
- **introducing *RENRAKU!***  
  renraku's first motivation was to provide nice calling interfaces like this:  
  ```js
  // beautiful and enlightened 😇
  const details = await userTopic.getDetails(userId)
  ```

### ⛩️ lesson two: ignorance is bliss

- let's start by dividing your *backend* api into `Topic` implementations like this one below
  ```ts
  import {asTopic} from "renraku/dist/interfaces.js"

  // "user" topic implementation.
  // let's pretend this has important business logic
  export const makeUserTopic = () => asTopic({
   //                                  ↑
   //    (asTopic merely ensures the methods are async)

    // topics can only have async methods
    async getDetails(userId: string) {
      return {time: Date.now()}
    },

    // another async method
    async setNickname(nickname: string) {
      return void
    },
  })

  // user topic interface
  export type UserTopic = ReturnType<typeof makeUserTopic>
  ```
- then you should design your *frontend* systems to accept the topic *interfaces*, so they can use the topics but aren't coupled to any specific implementations
  ```js
  export const makeFrontSystem = ({userTopic}: {userTopic: UserTopic}) => ({
    async uiAction(userId: string) {

      // call method on user topic
      const details = await userTopic.getDetails(userId)
    },
  })
  ```
- this general decoupling pattern offers general flexibility, testability, mockability, portability
- renraku's philosophy relies on it. renraku is about generating api client objects that perfectly match the topic interface. that is, the api client objects themselves look and work the same as the actual implementations

### ⛩️ lesson three: api clients should be shape-shifters

- we use renraku `apiServer` to automatically expose topic implementations, setting some cors rules
  ```ts
  import {UserTopic} from "./business.js"
  import {apiServer} from "renraku/dist/api-server.js"

  export async function startUserServer(userTopic: UserTopic) {
    const server = await apiServer({
      logger: console,
      exposures: {
        userTopic: {
          exposed: userTopic,
          cors: {
            allowed: /^http\:\/\/localhost\:8\d{3}$/i,
            forbidden: /\:8989$/i,
          }
        }
      }
    })
    server.start(8001)
  }
  ```
- then we can use renraku `apiClient` to generate topic api client objects, which are ***actually impostors*** pretending to be topic implementations, but their methods secretly make api calls!
  ```ts
  import {UserTopic} from "./business.js"
  import {Shape} from "renraku/dist/interfaces.js"
  import {apiClient} from "renraku/dist/api-client.js"

  // generate a renraku api client
  export async function makeUserClient() {
    const api = await apiClient<{userTopic: UserTopic}>({
      url: "http://localhost:8001",

      // you must describe the runtime shape
      // so we enforce this with typescript to make it easy
      shape: {
        userTopic: {
          getDetails: "method",
          setNickname: "method,"
        }
      },
    })
    return api.userTopic
  }
  ```
- thus, working with an api client looks the same as working with the actual implementation
  ```ts
  // renraku client object
  const userTopic = await makeUserClient()

  // calling a method looks the same as for real implementation
  const details = await userTopic.getDetails()
  ```
- using typescript interfaces with this mix-and-match attitude buys you an incredible amount of freedom and flexibility
  ```ts
  // will we provide the real implementation?
  const system = clientsideSystem({userTopic: makeUserTopic()})

  // or maybe an api client instead?
  const system = clientsideSystem({userTopic: await makeUserClient()})

  // or maybe some ad-hoc testing?
  const system = clientsideSystem({userTopic: {
    async getDetails(userId) { throw new Error("TODO") },
    async setNickname(nickname) { throw new Error("TODO") },
  }})
  ```

### ⛩️ lesson four: advanced curries reduce repetition

...coming soon...

-----------------

old readme

## *RENRAKU* exposes async functions as an api

- 🔆 expose some async functions on your server
- 📡 call them remotely from browser or node, with noice syntax
- ☎ json rpc under the hood
- 🛡 simple security model
  - 🔓 cors rules for public endpoints
  - 🔒 public key whitelist for signed requests

## *RENRAKU* leads by example

- **node: create an api server,** and listen on port 8001  
  &nbsp;&nbsp; *[(example-server.ts)](source/internals/examples/example-server.ts)*  
  ```ts
  import {apiServer} from "renraku/dist/api-server.js"
  import {NuclearApi} from "./example-common.js"

  export async function exampleServer() {

    // create the server
    const server = await apiServer<NuclearApi>({
      logger: console,
      exposures: {
        reactor: {
          exposed: {

            // an exposed api function
            async generatePower(a: number, b: number) {
              return a + b
            },

            // another api function
            async radioactiveMeltdown() {
              throw new Error("meltdown error")
            }
          },

          // browser cors permissions
          cors: {
            allowed: /^http\:\/\/localhost\:8\d{3}$/i,
            forbidden: /\:8989$/i,
          }
        }
      }
    })

    // listen on port 8001
    server.start(8001)
  }
  ```
  - you just give renraku some async methods to expose
  - this example shows a public endpoint, with some example cors rules

- **browser or node: create an api client,** and remotely call exposed methods  
  &nbsp;&nbsp; *[(example-client.ts)](source/internals/examples/example-client.ts)*  
  ```ts
  import {apiClient} from "renraku/dist/api-client.js"
  import {NuclearApi, nuclearShape} from "./example-common.js"

  export async function exampleClient() {

    // create the api client
    const {reactor} = await apiClient<NuclearApi>({
      url: "http://localhost:8001",
      shape: nuclearShape
    })

    // call an api method
    const result = await reactor.generatePower(1, 2)

    // log the result
    console.log(result === 3 ? "✔ success" : "✘ failed")
    return reactor
  }
  ```
  - shape object describes api surface area, so renraku can build the client
  - typescript enforces that the shape object matches the interface

## *RENRAKU* believes in testability and ergonomics

- traditionally to call an api, you'll find a nasty pattern:
  ```js
  // ugly and bad
  const details = await api.apiCall("user.getDetails", userId)
   //                        ↑             ↑
   //    [library coupling, gross!]   [string literal, yuck!]
  ```
- **introducing *RENRAKU!***
  ```js
  // beautiful and enlightened
  const details = await user.getDetails(userId)
  ```
- this pattern is superior for decoupling, testability, and developer experience

## *RENRAKU* is still an unstable work-in-progress

<br/>

<em style="display: block; text-align: center">— RENRAKU means 'contact' —</em>
