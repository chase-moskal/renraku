
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

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
