
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

## RENRAKU is a web api library
- **create an api server,** and listen on port 8001
  ```ts
  const server = createApiServer({
    debug: true,
    logger: console,
    exposures: {
      reactor: {
        methods: {
          async generatePower(a, b) {
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
  server.start(8001)
  ```
  - you just give renraku some async methods to expose
  - permissions are explicit
  - in `debug` mode, errors are sent back to the clients

- **create an api client,** and call a method
  ```ts
  const {reactor} = await createBrowserApiClient({
    url: "http://localhost:8001",
    shape: {
      reactor: {
        methods: {
          generatePower: true,
          radioactiveMeltdown: true
        }
      }
    }
  })
  const result = await reactor.methods.generatePower(1, 2)
  ```
  - shape object describes api surface area, so renraku can build the client
  - typescript enforces that the shape object matches the interface
  - `methods` exists to leave room for future renraku features, perhaps `events`

- see the typescript examples [example-server.ts](source/example/example-server.ts) and [example-client.ts](source/example/example-client.ts) for more details

## RENRAKU believes in testability and ergonomics
- traditionally to call an api, you'll find a nasty pattern:
  ```js
  // ugly and bad
  const userDetails = await api.apiCall("user.getDetails", userId)
  ```
- **introducing *RENRAKU!***
  ```js
  // beautiful and enlightened
  const userDetails = await user.getDetails(userId)
  ```
- you see, your code should not have any coupling to the api library
- traditionally, people create a special wrapper class which is coupled to the library — but this is a maintenance headache — instead, renraku aims to eliminate this intermediary wrapper, instead using typescript to infer it
- with renraku, the api client is an object which simply matches the interface for the serverside functionality
- therefore, your code doesn't even care whether an object is a real implementation, or a mock, or is actually a renraku client sending requests to your api server under-the-hood — so long as the object matches the interface, you can use it
- using renraku, your code is no longer coupled to the api library, which makes passing mocks for testing and development much easier
- so your app can create your renraku clients on startup, and pass those into your system — if however you decided to pass mocks instead, your system will be none the wiser ;)

## RENRAKU believes in typescript
- javascript is all you need to use renraku, but typescript is great with renraku because you can use typescript to enforce that the clientside shape objects match your serverside types

<br/>

<em style="display: block; text-align: center">— RENRAKU means 'contact' —</em>
