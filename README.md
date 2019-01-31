
# 連絡 — RENRAKU — れんらく

*concept node api json rpc*

```
example-project/
  isomorphic/
  server/
  client/
```

## example/source/isomorphic

```ts
import * as renraku from "renraku"

export interface ExampleTopic extends renraku.ApiTopic {
  exampleMethodAlpha(a: number): Promise<number>
  exampleMethodBravo(a: number, b: number): Promise<number>
}

export interface ExampleApi extends renraku.Api {
  topics: {
    exampleTopic: ExampleTopic
  }
}
```

## example/source/server

```ts
import * as renraku from "renraku"
import {ExampleApi, ExampleTopic} from "../isomorphic"

const server = new renraku.Server<ExampleApi>({
  callee: {
    topics: {
      exampleTopic: {
        async exampleMethodAlpha(a) { return a + 1 },
        async exampleMethodBravo(a, b) { return a + b }
      }
    }
  },
  permissions: [
    {
      origin: /^http\:\/\/localhost\:8080$/i,
      allowedTopics: {
        exampleTopic: ["exampleMethodAlpha", "exampleMethodBravo"]
      }
    }
  ]
})

server.start(8001)
```

## example/source/client

```ts
import * as renraku from "renraku"
import {ExampleApi} from "../isomorphic"

async function main() {
  const {callable} = await renraku.connect<ExampleApi>({
    serverUrl: "http://localhost:8001"
  })

  const {exampleTopic} = callable.topics
  const result1 = await exampleTopic.exampleMethodAlpha(3)
  const result2 = await exampleTopic.exampleMethodAlpha(3, 2)

  console.log(result1) //> 4
  console.log(result2) //> 5
}
```
