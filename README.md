
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

— **renraku is coming soon** —  
&nbsp;&nbsp;&nbsp; *concept node api json rpc*

## renraku creates fluent node api's

traditionally, to make a call to an api, you'd do something like this:

```js
// old and not cool
const userDetails = await api.apiCall("user.getDetails", [userId])
```

**introducing *renraku:***

```js
// the future
const userDetails = await user.getDetails(userId)
```

renraku features:
- natural syntax with no more string literals to maintain
- interchangable client object and server implementation (great for testing)
- typings provide intellisense hints
- typescript devs see errors in realtime (errors like a client/server api signature mismatch)

renraku terminology:
- `api` contains topics
- `topic` contains functions
- `shape` is json describing topic signature

## renraku leads by example

### `example/source/server.js` — on your node server, expose some functionality

```ts
import {createApiServer} from "renraku"

const server = createApiServer([
  {
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      reactor: {
        async generatePower(a, b) { return a + b },
        async radioactiveMeltdown(): Promise<void> {
          throw new Error("meltdown error")
        }
      }
    }
  }
])

server.start(8001)
```

- topic objects must only have async functions
- you can pass multiple exposures to expose different topics to different origins

### `example/source/client.js` — call your functions from node or a browser

```ts
import {createApiClient} from "renraku"

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
  const result1 = await exampleTopic.generatePower(3)
  console.log(result1)
   //> 3

  const result2 = await exampleTopic.radioactiveMeltdown()
   //> Error: meltdown error
}
```

- you have to describe the shape of the api.  
  this allows renraku to generate callable topic functions.  
  if you use typescript, it will enforce that the shape is maintained  

## enhancements for typescript devs

to use renraku, the javascript examples above are all you need

additionally however, typescript devs can benefit by receiving compile-time errors, for example whenever a clientside shape object doesn't match a serverside implementation

to achieve this, carefully follow the examples below, and pay special attention to the usage of `AbstractApiTopic` on the serverside

### `example/source/common.ts`

```ts
import {Api, Topic} from "renraku"

// topic interface, shared between server and client
export interface ReactorTopic extends Topic {
  generatePower(a: number): Promise<number>
  radioactiveMeltdown(a: number, b: number): Promise<number>
}

// api interface, shared between server and client
export interface NuclearApi extends Api {
  reactor: ReactorTopic
}
```

### `example/source/server.ts`

```ts
import {createApiServer, AbstractTopic} from "renraku"
import {ReactorTopic} from "./common"

class Reactor extends AbstractTopic implements ReactorTopic {
  async generatePower(a: number, b: number) { return a + b },
  async radioactiveMeltdown() { throw new Error("meltdown error") }
}

const server = createApiServer([
  {
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      reactor: new Reactor()
    }
  }
])
```

### `examples/source/client.ts`

```ts
import {createApiClient} from "renraku"
import {NuclearApi, nuclearApiShape} from "./common"

const nuclearApiShape: ApiShape<NuclearApi> = {
  reactor: {
    generatePower: true,
    radioactiveMeltdown: true
  }
}

async function main() {
  const {reactor} = await createApiClient<NuclearApi>({
    url: "http://localhost:8001",
    shape: nuclearApiShape
  })

  const result = await reactor.generatePower(1, 2)
  console.log(result)
   //> 3
}
```

<br/>

<em style="display: block; text-align: center">— renraku means 'contact' —</em>
