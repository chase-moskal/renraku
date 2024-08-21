
# RENRAKU experimental features

<br/>

## notifications

- **`notification`**
  - a `query` is a request which elicits a response
    - this is the default
  - a `notification` is a request which does not want a response
    - this might help you make your apis marginally more efficient
    - you can designate certain remote functions as notifications
  - because of the way the json-rpc spec is designed, the requester actually decides whether they send a query or a notification -- so this behavior is not something the server decides -- and thus, it's a setting for our remote
  ```ts
  import {remote, settings} from "renraku"

  const fns = remote(endpoint)

  // so here's an ordinary query
  await fns.hello.world()

  // and now we change the setting for this function
  fns.hello.world[settings].notification = true

  // from now on, this function operates as a notification
  await fns.hello.world()
  ```
  - alternatively, you can set the whole remote to notifications-by-default like this:
  ```ts
  const fns = remote(endpoint, {notification: true})
  ```

