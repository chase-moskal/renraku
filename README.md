
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

— **renraku is coming soon** —  
&nbsp;&nbsp;&nbsp; *concept node api json rpc*

renraku creates fluent node api's

traditionally, to make a call to an api, you'd do something like this:

```js
const userDetails = await api.apiCall("user.getDetails", [userId])
```

**introducing *renraku:***

```js
const userDetails = await api.user.getDetails(userId)
```

renraku's important features:
- natural syntax with no more string literals to maintain
- interchangable client object and server implementation (great for testing)
- typings provide intellisense hints
- typescript devs can see critical errors in realtime

renraku terminology:
- `api` contains topics
- `topic` contains functions
- `shape` is a json structure used to generate client callables

## actions speak louder than words

### `example/source/server.js` — on your node server, expose some functionality

```ts
import * as renraku from "renraku"

const server = renraku.createServer([
  {
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      exampleTopic: {
        async exampleFunctionAlpha(a) { return a + 1 },
        async exampleFunctionBravo(a, b) { return a + b }
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
import * as renraku from "renraku"

async function main() {

  // create the renraku client
  const {exampleTopic} = await renraku.createClient({
    url: "http://localhost:8001",
    shape: {
      exampleTopic: {
        exampleFunctionAlpha: true,
        exampleFunctionBravo: true
      }
    }
  })

  // ergonomic usage
  const result1 = await exampleTopic.exampleFunctionAlpha(3)
  const result2 = await exampleTopic.exampleFunctionBravo(3, 2)

  console.log(result1) //> 4
  console.log(result2) //> 5
}
```

- you have to describe the shape of the api.  
  this allows renraku to generate callable topic functions.  
  if you use typescript, it will enforce that the shape is maintained  

## extra features for typescript devs

the javascript examples above are all you need to use renraku

typescript devs can benefit by recieving compile-time errors when a clientside shape object doesn't match a serverside implementation

to achieve this, carefully follow the examples below, and pay special attention to the usage of `AbstractApiTopic` on the serverside

### `example/source/common.ts`

```ts
import * as renraku from "renraku"

// topic interface, shared between server and client
export interface ExampleTopic extends renraku.ApiTopic {
  exampleFunctionAlpha(a: number): Promise<number>
  exampleFunctionBravo(a: number, b: number): Promise<number>
}

// api interface, shared between server and client
export interface ExampleApi extends renraku.Api {
  exampleTopic: ExampleTopic
}

// api shape interface, for the client
export const exampleApiShape: ApiShape<ExampleApi> = {
	exampleTopic: {
		exampleFunctionAlpha: true,
		exampleFunctionBravo: true
	}
}
```

### `example/source/server.ts`

```ts
import * as renraku from "renraku"
import {ExampleTopic} from "./common"

class ExampleTopicImplementation extends AbstractApiTopic
  implements ExampleTopic {
  async exampleFunctionAlpha(a) { return a + 1 },
  async exampleFunctionBravo(a, b) { return a + b }
}

const server = createServer([
  {
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      exampleTopic: new ExampleTopicImplementation()
    }
  }
])
```

### `examples/source/client.ts`

```ts
import * as renraku from "renraku"
import {ExampleApi} from "./common"

async function main() {

  const {exampleTopic} = await renraku.createClient<ExampleApi>({
    url: "...",
    shape: {
      exampleTopic: {
        exampleFunctionAlpha: true,
        exampleFunctionBravo: true
      }
    }
  })
}
```

<br/><br/>

<em style="display: block; text-align: center">— renraku means 'contact' —</em>
