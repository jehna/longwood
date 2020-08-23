<center>

![Travis CI build status](https://travis-ci.org/jehna/longwood.svg?branch=master)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/longwood.svg?style=flat)](https://www.npmjs.com/package/longwood)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

</center>

# Longwood

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
const render = ul(
  li(text('Hello')),
  li(text('World'))
)
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

Longwood does not force you to use any specific state handling, but it allows
you to use any state handling library you wish. State changes are communicated
with an intermediate object called `ChangeableValue`. `ChangeableValue` consists
of two methods:

```
{
  valueOf() { ... }
  onChange(callback) { ... }
}
```

The `valueOf` method returns the current value and `onChange` is a method that
takes a callback which should be fired when the value changes.

You can easily wrap e.g. Redux with `ChangeableValue`, use our
[longwood-usestate](https://www.npmjs.com/package/longwood-usestate) package
that implements React's useState hook style state handling or roll your own on
top of rxjs, bacon.js or others.

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
