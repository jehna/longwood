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

### Custom components

Custom components in Longwood are simply functions. You can split your
components up without any overhead:

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
those to Longwood is simple when you know the basics.

#### A simple asynchronous state

First thing you need to know is that each Longstate component is its own small
render function:

```js
const renderDiv = div()
renderDiv(document.getElementById('app')) // Renders a empty div
```

If we look closer, we can see that all Longstate components take in a parent
argument and return the created element:

```js
const renderDiv = div()
const parent = document.getElementById('app')
const createdDivElement = renderDiv(parent)
```

Normally we would create our custom Longstate function like this:

```js
const Greet = ({ who }) => div(text(`Hello ${who}`))
```

But when you think that a render function takes in a parent and returns the
element, our component is equivalent to this:

```js
const Greet = ({ who }) => (parent) => {
  const renderHello = div(text(`Hello ${who}!`))
  const element = renderHello(parent)
  return element
}
```

As you can see, this component returns a function that takes in a parent
argument and returns the created element, just like all other Longwood
components.

The render function can also be used to re-render elements:

```js
import { div, text } from 'longwood'

const renderFoo = div(text('Foo'))
const renderBar = div(text('Bar'))
const target = document.getElementById('app')
renderFoo(target) // Renders text "Foo"
setTimeout(() => renderBar(target), 1000) // Changes text to "Bar" after a second
```

When Longwood re-renders an element, it reuses as much existing DOM elements as
possible, so it's very performant without using intermediate virtual DOM. It
also means that server-side rendering works out of the box with Longwood.

Knowing all this we can implement a simple asynchronous loader component:

```js
import { div, text } from 'longwood'

function AsyncJokeLoader() {
  return (parent) => {
    fetchRandomDadJoke().then(({ joke }) => {
      // After the fetch completes, we can re-render the component:
      const renderJoke = div(div(text('The joke is here:')), div(text(joke)))
      renderJoke(parent)
    })

    // First time we render a simple loading component
    const renderLoading = div(text('Loading the joke...'))
    return renderLoading(parent)
  }
}

const fetchRandomDadJoke = () =>
  fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' }
  }).then((res) => res.json())
```

Here the component renders a loading text first and then re-renders the result
as soon as the request finishes.

This trivial example could be extended to use any general state management
library instead of promises. You could use rxjs subscriptions, Redux selectors
or Firebase listeners, and they are all as easy to implement as our little
example.

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
import { div } from 'longwood'

const render = div({ innerText: 'Hello world!' })
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
