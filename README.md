
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
- cors security for public endpoints
- *todo:* signed request security via a certificate whitelist

RENRAKU terminology:
- `api` contains topics
- `topic` contains functions
- `shape` is json describing topic signature

## RENRAKU leads by example

### [`example-server.ts`](source/example/example-server.ts) — on your node server, expose some functionality

### [`example-client.ts`](source/example/example-client.ts) — call your functions from node or a browser

- the client provides a shape object so RENRAKU can generate callable functions.  
  typescript will enforce that the shape is correctly maintained  

## RENRAKU is good for typescript devs

javascript is all you need to use RENRAKU

however, typescript devs can benefit by receiving compile-time errors, for example whenever a clientside shape object doesn't match a serverside implementation

<br/>

<em style="display: block; text-align: center">— RENRAKU means 'contact' —</em>
