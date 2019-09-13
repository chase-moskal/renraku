
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

— **node api library** —  
&nbsp;&nbsp; *featuring seamless calling*

## RENRAKU creates seamless node api's

traditionally, to call an api, you'd do something like this:

```js
// old and not cool
const userDetails = await api.apiCall("user.getDetails", [userId])
```

**introducing *RENRAKU!***

```js
// the future
const userDetails = await user.getDetails(userId)
```

RENRAKU features:
- natural syntax with no more string literals to maintain
- interchangable client object and server implementation (great for testing)
- typings provide intellisense hints
- typescript devs see errors in realtime (errors like a client/server api signature mismatch)

RENRAKU terminology:
- `api` contains topics
- `topic` contains functions
- `shape` is json describing topic signature

## RENRAKU leads by example

### `server.js` — on your node server, expose some functionality

```ts
import {createApiServer} from "renraku/dist/server/create-api-server.js"

const server = createApiServer({
  exposures: [{
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      reactor: {
        async generatePower(a, b) {
          return a + b
        },
        async radioactiveMeltdown(): Promise<void> {
          throw new Error("meltdown error")
        }
      }
    }
  }]
})

server.start(8001)
```

- topic objects must only have async functions
- you can pass multiple exposures to expose different topics to different origins

### `client.js` — call your functions from node or a browser

```ts
import {createApiClient} from "renraku/dist/client/create-api-client.js"

async function main() {

  // create the renraku client
  const {reactor} = await createApiClient({
    url: "http://localhost:8001",
    shape: {
      reactor: {
        generatePower: true,
        radioactiveMeltdown: true
      }
    }
  })

  // ergonomic usage
  const result1 = await reactor.generatePower(1, 2)
  console.log(result1)
   //> 3

  const result2 = await reactor.radioactiveMeltdown()
   //> Error: meltdown error
}
```

- you have to describe the shape of the api to the client.  
  this allows RENRAKU to generate callable topic functions.  
  if you use typescript, it will enforce that the shape is correctly maintained  

## RENRAKU is good for typescript devs

to use RENRAKU, the javascript examples above are all you need

additionally however, typescript devs can benefit by receiving compile-time errors, for example whenever a clientside shape object doesn't match a serverside implementation

to achieve this, carefully follow the examples below, and pay special attention to the usage of `AbstractApiTopic` on the serverside

<br/>

<em style="display: block; text-align: center">— RENRAKU means 'contact' —</em>
