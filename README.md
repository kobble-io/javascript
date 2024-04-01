![Add authentication to your Single Page Application with Kobble Auth SDK.](https://github.com/kobble-io/auth-spa-js/blob/main/.readme/banner.png?raw=true)

[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/:status-stable-green.svg?style=flat)


This package helps you add authentication to your Single Page Application with Kobble Auth SDK in under 10 minutes.

It's secure by design (using PKCE flow), easy to use, and works with any JavaScript framework.

## Getting Started

### Installation

Using [npm](https://npmjs.org) in your project directory run the following command:

```sh
npm install @kobbleio/auth-spa-js
```

### Configure Kobble

Create an **Application** in your [Kobble Dashboard](https://app.kobble.io/p/applications).

Make sure your application can handle your localhost callback URL (see section below).

Note the **Client ID** and your **Portal Domain** values.

### Configure the SDK

Create a `KobbleClient` instance before rendering or initializing your application. You should only have one instance of the client.

```js
import { createKobbleClient } from '@kobbleio/auth-spa-js';

const kobble = createKobbleClient({
    domain: 'https://<YOUR_PORTAL_DOMAIN>',
    clientId: '<YOUR_CLIENT_ID>',
    redirectUri: '<YOUR_CALLBACK_URL>',
});
```

> **Note**: `<YOUR_CALLBACK_URL>` must be allowed in your Kobble Application. In that route you must call the `handleRedirectCallback` to complete the flow (see the section below).

Then you can use the `kobbleClient` instance to log in, log out, and check the user's authentication status and more.

### Logging In

```html
<button id="login">Click to Login</button>
```

```js
// redirect to your Kobble Customer Portal
document.getElementById('login').addEventListener('click', async () => {
  await kobble.loginWithRedirect();
});

// in your callback route (i.e. https://localhost:3000/callback)
window.addEventListener('load', async () => {
  const redirectResult = await kobble.handleRedirectCallback();
  // logged in. you can get the user profile like this:
  const user = await kobble.getUser();
  console.log(user);
});
```

## Available methods

- `loginWithRedirect()`: Redirects the user to the Universal Login Page.
- `handleRedirectCallback()`: Handles the callback from the Universal Login Page.
- `getUser()`: Returns the user profile.
- `logout()`: Logs the user out.
- `getAccessToken()`: Returns the user's access token (to send to Kobble Gateway).


### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/kobble-io/auth-spa-js/issues).

___

## What is Kobble?

<p align="center">
  <picture>
    <img alt="Kobble Logo" src="https://github.com/kobble-io/auth-spa-js/blob/main/.readme/logo.png?raw=true" width="150">
  </picture>
</p>
<p align="center">
 Kobble is the one-stop solution for monetizing modern SaaS and APIs. It allows to add authentication, analytics and payment to any app in under 10 minutes.
</p>