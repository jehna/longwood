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
const render = div({ innerText: 'Hello world' })
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/beautiful-surf-8ytcx?file=/src/index.ts)

This creates a `<div>` element which has `innerText` set to "Hello world" and
mounts the component inside `<div id="app">` element.

### Nesting components

You can nest components by provding the `children` property:

```js
const render = ul({
  children: [
    li({ innerText: 'Hello' }),
    li({ innerText: 'World' })
  ]
})
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/gallant-mccarthy-g60j0?file=/src/index.ts)

### Custom components

Custom components in Longwood are simply functions. You can split your
components up without any overhead:

```js
const Greet = ({ who }) => div({ innerText: `Hello ${who}` })
const render = Greet({ who: 'world' })
render(document.getElementById('app'))
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/nameless-resonance-sntg7?file=/src/index.ts)

The beauty of this is, that (unlike with e.g. at React) these components will be
treated as optimizable Javascript, so you can use UglifyJS to achieve _zero-cost
abstractions_.

## Getting started (ES Modules)

Longwood is available as ES module, so quickest way to get started is to import
the module directly within your HTML page:

```html
<html>
<body>
<div id="app"></div>
<script type="module">
import { div } from 'https://cdn.skypack.dev/longwood';

const render = div({ innerText: 'Hello world!' });
render(document.getElementById('app'));
</script>
```

[▶️ Run in CodeSandbox.io](https://codesandbox.io/s/affectionate-mendel-yzwje?file=/index.html)

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
import { div } from 'longwood';

const render = div({ innerText: 'Hello world!' });
render(document.getElementById('app'));
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
