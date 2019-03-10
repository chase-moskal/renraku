
# 連絡 <br/> れんらく <br/> ***R·E·N·R·A·K·U***

— **renraku is coming soon** —  
&nbsp;&nbsp;&nbsp; *concept node api json rpc*

## explanation through examples

### `example/source/server` — expose functionality on the node server

```ts
import * as renraku from "renraku"
import {ExampleApi} from "../common"

// create a node api server
const server = new renraku.Server<ExampleApi>({

  // expose some async functionality
  callee: {
    topics: {
      exampleTopic: {
        async exampleMethodAlpha(a) {
          return a + 1
        },
        async exampleMethodBravo(a, b) {
          return a + b
        }
      }
    }
  },

  // simple access control whitelist
  permissions: [
    {
      // origins that pass this regular expression are allowed
      origin: /^http\:\/\/localhost\:8080$/i,

      // explicit control over which topics and methods are allowed
      allowedTopics: {
        exampleTopic: ["exampleMethodAlpha", "exampleMethodBravo"]
      }
    }
  ]
})

// start the api server
server.start(8001)
```

### `example/source/client` — remotely call the exposed functions

```ts
import * as renraku from "renraku"
import {ExampleApi} from "../common"

async function main() {

  // connect with the server and ascertain the callable object.
  // works in browser or on node
  const {callable} = await renraku.connect<ExampleApi>({
    serverUrl: "http://localhost:8001",
    apiSignature: {
      exampleTopic: {
        exampleMethodAlpha: {},
        exampleMethodBravo: {}
      }
    }
  })

  // grab the example topic
  const {exampleTopic} = callable.topics

  // call the topic's methods
  const result1 = await exampleTopic.exampleMethodAlpha(3)
  const result2 = await exampleTopic.exampleMethodBravo(3, 2)

  console.log(result1) //> 4
  console.log(result2) //> 5
}
```

### `example/source/common` — proper typings

```ts
import * as renraku from "renraku"

// common api definition shared by server and client alike
export interface ExampleApi extends renraku.Api {
  topics: {
    exampleTopic: {
      exampleMethodAlpha(a: number): Promise<number>
      exampleMethodBravo(a: number, b: number): Promise<number>
    }
  }
}
```

— *renraku means 'contact'* —
