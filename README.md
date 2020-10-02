
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

🔆 typescript api library of the future  
&nbsp; &nbsp; 🌐 elegantly make or use json rpc api's  
&nbsp; &nbsp; 📡 isomorphic client works in node and browsers  

🧠 genius-level decoupled architecture  
&nbsp; &nbsp; 🛎️ expose async functions on json rpc endpoints  
&nbsp; &nbsp; 🎭 shapeshifting api clients impersonate implementations  
&nbsp; &nbsp; 🛠️ advanced curries for auth and more  

🛡 straightforward security model  
&nbsp; &nbsp; 🔓 cors rules for public endpoints  
&nbsp; &nbsp; 🔒 public key whitelist for signed requests  

## RENRAKU'S SCHOOL ON WEB API BEST PRACTICES

- renraku began with the principal: *"a good api library should simply disappear".* api libraries should abstract away the api details to such a degree that calling remote methods looks the same as calling local methods
- here we explain renraku by sharing the lessons learned while developing and using renraku privately for years

### ⛩️ RENRAKU LESSON ONE — *wisdom is knowing the right path to take*

- traditionally to call an api, you'll often find a nasty old pattern along these lines:
  ```js
  // ugly and bad: don't make direct api calls like this
  const details = await api.apiCall("userTopic.getDetails", userId)
   //                        ↑             ↑
   //    [library coupling, gross!]   [string literal, yuck!]
  ```
- **introducing *RENRAKU!***  
  ```js
  // natural and enlightened
  const details = await userTopic.getDetails(userId)
  ```
  of course. renraku's first motivation was to "abstract away" the api library like this.  
  but as you'll see, renraku grew as set of typescript practices and tools sprouting from this idea

### ⛩️ RENRAKU LESSON TWO — *life is suffering, but ignorance is bliss*

- with renraku, we divide our ***backend*** business logic into "topic" implementation objects.  
  topics can only have async functions as members
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
    async setNickname(userId: string, nickname: string) {
      return void
    },
  })

  // infer user topic interface
  export type UserTopic = ReturnType<typeof makeUserTopic>
  ```
- then we design our ***frontend*** systems to accept the topic *interfaces*
  ```js
  export const makeFrontSystem = ({userTopic}: {userTopic: UserTopic}) => ({
     //                                          ↑
     //                          (accepting a topic interface...
     //                           it might be an implementaton,
     //                           or an api-client,
     //                           or just some mocks for testing..
     //                           it doesn't matter to us here)

    async uiAction(userId: string) {

      // call topic method
      const details = await userTopic.getDetails(userId)
    },
  })
  ```
- of course, this general decoupling pattern offers flexibility, testability, mockability, and portability, and is wise for most any system
- and renraku's philosophy relies on it. next we'll use renraku to bridge the gap between backend and frontend systems like these

### ⛩️ RENRAKU LESSON THREE — *api clients should be shapeshifters*

- on the ***serverside,*** we use renraku `apiServer` to create a node server and expose topic implementations.  
  security rules like cors can be set for each topic
  ```ts
  import {UserTopic} from "./business.js"
  import {apiServer} from "renraku/dist/api-server.js"

  export async function startUserServer(userTopic: UserTopic) {
     //                                  ↑
     //                      (remember you could pass mocks here!)

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
- on the ***clientside,*** we use renraku `apiClient` to generate topic api client objects.  
  for each topic, we generate a "shapeshifter" api client object, which is *actually an impostor* pretending to be a topic implementation.. their methods secretly make api calls, but the frontend is none the wiser!
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
          setNickname: "method",
        }
      },
    })
    return api.userTopic
  }

  // examples for clarity
  ;(async() => {

    // create the api client object
    const userTopic = await makeUserClient()

    // call an api method: looks the same as real topic implementation
    const details = await userTopic.getDetails("u123")

    // now when we go to create our frontend systems,
    // we have a great deal of flexibility

    // we might: pass in the api client object (frontend will call api)
    makeFrontSystem({userTopic})

    // or instead: pass in some mocks (frontend will call mocks)
    makeFrontSystem({userTopic: {
      async getDetails(userId) { throw new Error("TODO") },
      async setNickname(userId, nickname) { throw new Error("TODO") },
    }})
  })()
  ```
- so in short
  - renraku bridges the gap with handy functions that turn topic objects into api servers or clients
  - properly decoupled architecture is insanely cool for mocks/tests/development in ways that are yet beyond your current understanding

### ⛩️ RENRAKU LESSON FOUR — *advanced curries reduce repetition for auth and more*

...prototype implementation is ready...  
...lesson coming soon...  

### ⛩️ RENRAKU LESSON FIVE — *custom http headers and such*

...yet to be implemented...  

-----------------

<br/>

<em style="display: block; text-align: center">— RENRAKU means "contact" —</em>
