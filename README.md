# Longwood    ![Travis CI build status](https://travis-ci.org/jehna/longwood.svg?branch=master) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/longwood.svg?style=flat)](https://www.npmjs.com/package/longwood) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> A simple user interface library

## Principles

Longwood can be summarized with these three principles:

1. **It's just JavaScript**<br>
   This view library does not invent a new syntax for templating — you can use
   traditional Javascript without any build tools.
2. **Beginner friendly**<br>
   No magic. Longwood does not introduce complicated concepts that you'll need
   a PhD in computer science to understand.
3. **Strong Typescript support**<br>
   When you're ready, jump in with Typescript and have clear and strong types
   there to help you.

## Example

Longwood uses composition to describe component hierarchies. In practice, here's
the "hello world" of Longwood:

```js
const render = div(text('Hello world'))
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/great-violet-esnk4?file=/src/index.ts)

This creates a `<div>` element which has a child [`Text`
node](https://developer.mozilla.org/en-US/docs/Web/API/Text) containing "Hello
world" and mounts the component inside `<div id="app">` element.

### Nesting components

You can nest multiple components:

```js
const render = ul(li(text('Hello')), li(text('World')))
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/priceless-johnson-t74sh?file=/src/index.ts)

### Passing props

You have all common props from HTML element JS API available, and you can
provide an pbject as the first argument to pass them in. In this case you'll
need to use the named `children` prop to pass in the child components:

```js
const render = div({
  children: [text('Hello world')],
  className: 'my-app'
})
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/interesting-rgb-ee4bb?file=/src/index.ts)

### Components

Components in Longwood are simply functions. You can split your components up
without any overhead:

```js
const Greet = ({ who }) => div(text(`Hello ${who}`))
const render = Greet({ who: 'world' })
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/sad-fermat-ujp15?file=/src/index.ts)

The beauty of this is, that (unlike with e.g. at React) these components will be
treated as optimizable Javascript, so you can use UglifyJS to achieve _zero-cost
abstractions_.

### State management

Longwood does not force you to use any specific state handling, in fact it does
not have any state handling built in, because state handling should not be part
of a view library.

There are many great state handling libraries out there, and connecting any of
those to Longwood is simple.

#### A simple asynchronous state

How do you update your dom after your state changes? You call the render again
with fresh data:

```js
export default function AsyncJoke({ joke }) {
  if (!joke) return div(text('Loading the joke...'))
  return div(div(text('The joke is here:')), div(text(joke)))
}

const target = document.getElementById('app')

const renderInitial = AsyncJoke({ joke: undefined })
renderInitial(target)

fetchRandomJoke().then((joke) => {
  const renderWithJoke = AsyncJoke({ joke })
  renderWithJoke(target)
})
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/prod-cookies-i43wg?file=/src/index.ts)

Here the component renders a loading text first and then re-renders the result
as soon as the request finishes.

This trivial example could be extended to use any general state management
library instead of promises. You could use rxjs subscriptions, [Redux
selectors][redux-example] or Firebase listeners, and they are all as easy to
implement as our little example.

For people coming from React there's [longwood-usestate][longwood-usestate]
library that behaves close to how React's `useState` and `useContext` hooks do.

[redux-example]: https://codesandbox.io/s/dazzling-worker-vkpem?file=/src/index.ts
[longwood-usestate]: https://npmjs.com/package/longwood-usestate

## Getting started (ES Modules)

Longwood is available as ES module, so quickest way to get started is to import
the module directly within your HTML page:

```html
<html>
  <body>
    <div id="app"></div>
    <script type="module">
      import { div, text } from 'https://cdn.skypack.dev/longwood'

      const render = div(text('Hello world!'))
      render(document.getElementById('app'))
    </script>
  </body>
</html>
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/unruffled-star-xs16e?file=/index.html)

This is literally all the code you'll need! No build tools needed, no extra
steps, just save the code as a .html file and start hacking.

## Getting started (npm)

You can install Longwood to your project like a normal dependency within your
project:

```
yarn add longwood
```

Then you can import the package in your js file. For example if you're using
Webpack, you can do:

```js
import { div, text } from 'longwood'

const render = div(text('Hello world!'))
render(document.getElementById('app'))
```

## Developing

You can use TDD for development by running:

```
yarn
yarn test --watch
```

This runs Jest, and the tests use JSDOM for asserting how DOM looks like.

### Building

You can build the project by running:

```shell
yarn build
```

This builds the project into `build/` directory.

### Deploying

This project is automatically deployed to NPM by using Travis CI. All tagged
versions are published when pushed.

Don't add tags by hand! Run:

```shell
yarn release
```

This will run an interactive deploy script to help you deploy the most recent
version.

## Contributing

This is a very early version of the project, and all feedback is welcome. Please
open an issue before implementing, as the direction still needs some
adjustments.

## Licensing

The code in this project is licensed under MIT license.
