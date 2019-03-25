
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

— **renraku is coming soon** —  
&nbsp;&nbsp;&nbsp; *concept node api json rpc*

## actions speak louder than words

### `example/source/server.js` — expose functionality on the node server

```ts
import * as renraku from "renraku"

const server = renraku.createServer([
  {
    allowed: /^http\:\/\/localhost\:8\d{3}$/i,
    forbidden: /\:8989$/i,
    exposed: {
      exampleTopic: {
        async exampleMethodAlpha(a) { return a + 1 },
        async exampleMethodBravo(a, b) { return a + b }
      }
    }
  }
])

server.start(8001)
```

### `example/source/client.js` — remotely call the exposed functions

```ts
import * as renraku from "renraku"

async function main() {
  const {exampleTopic} = await renraku.createClient({
    serverUrl: "http://localhost:8001",
    shape: {
      exampleTopic: {
        exampleMethodAlpha: true,
        exampleMethodBravo: true
      }
    }
  })

  // call the topic's methods
  const result1 = await exampleTopic.exampleMethodAlpha(3)
  const result2 = await exampleTopic.exampleMethodBravo(3, 2)

  console.log(result1) //> 4
  console.log(result2) //> 5
}
```

## that's all you need, but you might want to 

### `example/source/common.ts` — you might share

```ts
import * as renraku from "renraku"

// typescript interface for the api, shared between server and client
export interface ExampleApi extends renraku.Api {
  exampleTopic: {
    exampleMethodAlpha(a: number): Promise<number>
    exampleMethodBravo(a: number, b: number): Promise<number>
  }
}

// serverside implementation of api functionality
export class ExampleApiImplementation implements renraku.Api {
  exampleTopic = {
    async exampleMethodAlpha(a) { return a + 1 },
    async exampleMethodBravo(a, b) { return a + b }
  }
}

// describes the clientside shape of the api to the renraku.createClient
export interface ExampleApiShape implements renraku.Shape<ExampleApi> {
  exampleTopic = {
    exampleMethodAlpha: true,
    exampleMethodBravo: true
  }
}

```

— *renraku means 'contact'* —
