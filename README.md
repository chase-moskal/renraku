
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

## RENRAKU is a web api library
- typescript-first
- json-rpc under the hood
- simple security model
  - cors rules for public endpoints

## RENRAKU leads by example
- **node: create an api server** and listen on port 8001 *[(example-server.ts)](source/internals/example/example-server.ts)*
  ```ts
  import {apiServer} from "renraku/dist/api-server.js"
  import {NuclearApi} from "renraku/dist/internals/example/example-common.js"

  export async function exampleServer() {

    // create the server
    const server = apiServer<NuclearApi>({
      debug: true,
      logger: console,
      exposures: {
        reactor: {
          methods: {
            async generatePower(a: number, b: number) {
              return a + b
            },
            async radioactiveMeltdown() {
              throw new Error("meltdown error")
            }
          },
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
  - permissions are explicit
  - in `debug` mode, api errors are sent back to the clients

- **browser: create an api client,** and call a method *[(example-client.ts)](source/internals/example/example-client.ts)*
  ```ts
  import {apiClient} from "renraku/dist/api-server.js"
  import {NuclearApi, nuclearShape} from "renraku/dist/internals/example/example-common.js"

  export async function exampleClient() {

    // create the api client
    const {reactor} = apiClient<NuclearApi>({
      url: "http://localhost:8001",
      shape: nuclearShape
    })

    // call an api method
    const result = await reactor.methods.generatePower(1, 2)

    console.log(result === 3 ? "✔ success" : "✘ failed")
    return reactor
  }
  ```
  - shape object describes api surface area, so renraku can build the client
  - typescript enforces that the shape object matches the interface
  - `methods` exists to leave room for future renraku features, perhaps `events`

## RENRAKU believes in testability and ergonomics
- traditionally to call an api, you'll find a nasty pattern:
  ```js
  // ugly and bad
  const details = await api.apiCall("user.getDetails", userId)
   //                        ↑            ↑
   //    [library coupling, gross!]   [string literal, yuck!]
  ```
- **introducing *RENRAKU!***
  ```js
  // beautiful and enlightened
  const details = await user.getDetails(userId)
  ```
- you code doesn't need to be coupled to a library
- traditionally, people create a special "repository" wrapper class which is coupled to the library — but this is a maintenance headache — instead, renraku aims to eliminate this intermediary wrapper, instead using typescript to infer and enforce it as much as possible
- renraku provides you with client objects which looks the same (match the same interface) as the implementations on the serverside (this is great for mocking and testing)
- therefore, your code doesn't even care whether an object is a real implementation, or a mock, or is actually a renraku client sending requests to your api server under-the-hood — so long as the object matches the interface, you can use it
- so your app can create your renraku clients on startup, and pass those into your system — if however you decided to pass mocks instead, your system will be none the wiser ;)

## RENRAKU is a work-in-progress and is subject to sudden refactors

<br/>

<em style="display: block; text-align: center">— RENRAKU means 'contact' —</em>
