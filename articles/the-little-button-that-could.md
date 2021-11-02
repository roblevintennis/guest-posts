<em class="explanation">The following is a guest post by Rob Levin. Rob is a Senior UI Engineer at <a href="https://ciphertrace.com/">CipherTrace of MasterCard</a>, and author of <a href="https://github.com/AgnosticUI/agnosticui">AgnosticUI</a> — a UI Component library that works in [React](...), [Vue](...), [Angular](...), and [Svelte](...). In this article, Rob shows you how a single `button.css` script can be used across multiple popular frameworks. In fact, this is the same technique Rob is using to implement AgnosticUI itself.</em> 

# The Little Button That Could

Your mission should you decide to accept it is to build a Button component in four frameworks (TBD), but, only use one `button.css` file!

## Let's go monorepo!

We're going to set up a tiny [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) based monorepo.

### package.json

First we'll initialize our top-level `package.json` with:

```shell
$ yarn init
yarn init v1.22.15
question name (articles): littlebutton
question version (1.0.0): 
question description: my little button project
question entry point (index.js): 
question repository url: 
question author (Rob Levin): 
question license (MIT): 
question private: 
success Saved package.json
```

That gives us a `package.json` with something like:

```json
{
  "name": "littlebutton",
  "version": "1.0.0",
  "description": "my little button project",
  "main": "index.js",
  "author": "Rob Levin",
  "license": "MIT"
}
```

### Workspaces

Now let's create the workspaces:

```shell
mkdir -p ./littlebutton-react littlebutton-svelte littlebutton-angular littlebutton-css
$ tree . # you don't need to do this but just showing you what things should look like:
├── littlebutton-angular
├── littlebutton-css
├── littlebutton-react
├── littlebutton-svelte
├── package.json
```

Now add these two lines to your top-level `package.json` so we keep the monorepo itself private, and have our workspaces setup:

```json
  ...
  "private": true,
  "workspaces": ["littlebutton-react", "littlebutton-vue", "littlebutton-svelte", "littlebutton-angular", "littlebutton-css"]
```

Now descend into the `littlebutton-css` directory. We'll want to generate a `package.json` with `yarn init`. Since we've named our directory `littlebutton-css` (the same as how we specified it in our `workspaces` in `package.json`) we can just hit the return key and accept all the prompts:

```shell
$ pushd ./littlebutton-css && yarn init && popd
yarn init v1.22.15
question name (littlebutton-css): 
question version (1.0.0): 
question description: 
question entry point (index.js): 
question repository url: 
question author (Rob Levin): 
question license (MIT): 
question private: 
success Saved package.json
```

Once you've done that for all the workspaces your directory structure should look like:

```shell
├── littlebutton-angular
├── littlebutton-css
│   └── package.json
├── littlebutton-react
└── package.json
```

So we've only got a `package.json` in the CSS package at this point. That's because we'll be generating our framework implementations with tools like `create-react-app` which want to generate the `package.json` for you. We will have to remember to name the `package.json` with the same name as our `workspaces` previously.

## HTML &amp CSS

Let's stay in the `./littlebutton-css` workspace and create our simple button component using vanilla HTML and CSS — `touch` an `index.html` and a `./css/button.css` so that the file structure looks like this:

```shell
├── css
│   └── button.css
├── index.html
└── package.json
```

And let's just &ldquo;connect the dots&rdquo; with some boilerplate:

```html
<!doctype html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <title>The Little Button That Could</title>
   <meta name="description"
         content="">
   <meta name="viewport"
         content="width=device-width, initial-scale=1">
   <link rel="stylesheet"
         href="css/button.css">
</head>
<body>
   <main>
      <button class="btn">Go</button>
   </main>
</body>
</html>
```

And in `./css/styles.css`:
```css
.btn {
  color: hotpink;
}
```

Now open up that `index.html` page by double-clicking it to view it as a local `file://` resource in your browser. If you see an ugly generic button with `hotpink` text you've succeeded.

## React

We'll go ahead and utilize `create-react-app` to kick off a React application in our `littlebutton-react` workspace. From the top-level directory do:

```shell
# See https://create-react-app.dev/docs/getting-started/#quick-start
cd littlebutton-react && npx create-react-app . && yarn start
```

Your system default browser should automatically open to `http://localhost:3000` and you should see the default React application.

With React installed and verified let's update that `App.js` to house our button with:

```jsx
import "./App.css";

const Button = () => {
  return <button>Go</button>;
};

function App() {
  return (
    <div className="App">
      <Button />
    </div>
  );
}

export default App;
```

### Copy the CSS

Now we're going to write a small node script to simply copy our `littlebutton-css/css/button.css` into our React application. This step is probably the most interesting one to me because it's both magical and ugly at the same time. It's magical, because it means our React button component is truly deriving it's styles from the same CSS written in the html/css project. It's ugly because, well, we are reaching up out of one workspace and grabbing a file from another ¯\_(ツ)_/¯

Add the following little NodeJS script to `littlebutton-react/copystyles.js`:

```js
const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
fs.writeFileSync("./src/button.css", css, "utf8");
```

Let's place a `node` command to run that in a `package.json` script that happens before the `start` script in `littlebutton-react/package.json`. We'll add a `syncStyles` and update the `start` to call `syncStyles` as such:

```json
"start": "yarn syncStyles && react-scripts start",
"syncStyles": "node copystyles.js",
```

Now, anytime we fire up our React application with `yarn start`, we'll first be copying the CSS file over. In essence, we're &ldquo;forcing$rdquo; ourselves to not diverge from the CSS package's `button.css` in our React button.

But we want to also leverage [CSS Modules](https://github.com/css-modules/css-modules), so we have one more step to do to get that wired up (from the same `littlebutton-react` directory):

```shell
touch button.module.css
```

The Webpack configuration that `create-react-app` ships with is set up to consider anything with the `*.module.[sc]ss` extension as a CSS module. See the [React CSS Modules docs](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/#buttonmodulecss). 

With that, open up that `button.module.css` and write:

```css
.btn {
  composes: btn from './button.css';
}
```

Congratulations, you've just utilized one of the coolest features of CSS modules…`composes` aka [composition](https://github.com/css-modules/css-modules#composition). In a nutshell we're copying our HTML/CSS version of `button.css` over wholesale, and then composing from our one `.btn` style rule.

With that, we can go back to our `App.js` and start to incorporate CSS modules into React JSX:

```jsx
import "./App.css";
import styles from "./button.module.css";

const Button = () => {
  return <button className={styles.btn}>Go</button>;
};

function App() {
  return (
    <div className="App">
      <Button />
    </div>
  );
}

export default App;
```

Whew! Ok, let's finally now try to run our React app again:

```shell
yarn start
```

If all went well, you should see that same generic button, but with `hotpink` text. Mind blown? Didn't think so — the button's too ugly for you, huh?! I get it. Let's just say we're doing UDD—ugly-driven development and, sorry, but we're not going to make things look pretty until the very end this tutorial. In fact, we're done with the React setup for now. Onwards.

## Update Monorepo

Before we move on to the next framework, let's move back up to our top-level monorepo directory and update its `package.json` with:

```json
{
  "name": "littlebutton",
  "version": "1.0.0",
  "description": "toy project",
  "main": "index.js",
  "author": "Rob Levin",
  "license": "MIT",
  "private": true,
  "workspaces": ["littlebutton-react", "littlebutton-vue", "littlebutton-svelte", "littlebutton-angular"],
  "scripts": {
    "start:react": "yarn workspace littlebutton-react start"
  }
}
```

Now in your terminal run `yarn` from top-level directory to get the monorepo hoisted dependencies installed.

All that we've added here is a `scripts` section. By adding `start:react` we can now run `yarn start:react` from our top-level directory and it will fire up the project we just built in `./littlebutton-react` — super convenient! 

_We'll tackle Vue and Svelte next. It turns out that we can take a pretty similar approach for both of these as they use Single File Components aka [SFC]. Basically, you get to mix HTML, CSS, and JavaScript all into one single file. Whether you like SFC or not, it's certainly adequate enough for building out presentational or primitive UI components._
## Vue

We'll go ahead and utilize Vue's recommended [instalation process](https://cli.vuejs.org/guide/installation.html) and first install the Vue CLI with:

```shell
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

From the monorepo's top-level directory we'll do:

```shell
vue create littlebutton-vue

# and select the default which at time of writing is:
❯ Default ([Vue 2] babel, eslint) 
```

When it's done you can verify Vue with:

```shell
cd littlebutton-vue && yarn serve
```

This may just work. But, if not, you've likely encountered the same hoisting issue I did (welcome to the wonderful world of [monorepo hoisting issues](https://github.com/vuejs/vue-cli/issues/4911#issuecomment-864234304)!). Do this:

In your top-level `package.json` add this stanza:

```json
   "devDependencies": {
      "@vue/cli-plugin-eslint": "~4.5.0"
   },
```

Now, you'll need to remove your top-level `yarn.lock` and reinstall everything with: `yarn install`. With that, you should now be able to verify Vue once again with:

```shell
cd littlebutton-vue && yarn serve # http://localhost:8080/ should now be serving Vue
```

Now update `App.vue` to:

```vue
<template>
  <div id="app">
    <Button class="btn">Go</Button>
  </div>
</template>

<script>
import Button from './components/Button.vue'

export default {
  name: 'App',
  components: {
    Button
  }
}
</script>
```

And we'll replace any `src/components` with just `src/compontns/Button.vue`:

```vue
<template>
   <button :class="classes"><slot /></button>
</template>

<script>
export default {
  name: 'Button',
  computed: {
    classes() {
      return {
        [this.$style.btn]: true,
      }
    }
  }
}
</script>

<style module>
.btn {
  color: slateblue;
}
</style>
```

Let's break this down a bit. With the `:class="classes"` we're using Vue's binding to call the `computed` `classes` method. The `classes` method, in turn, is utilizing CSS Modules with the `this.$style.btn` syntax. Also, the `<style module>` is essential to set up CSS Modules. For now, we're hard-coding `color: slateblue` simply to test we've got things working within the component properly. Try firing up the app again with `yarn serve`. If you see the purple text on the button it's working.

### Copy the CSS

Now we're going to write a similar node script we did for the React implementation that simply copies our `littlebutton-css/css/button.css` into our `Button.vue`. As mentioned, this component is a SFC so we're going to have to do this slightly differently using a simple [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

Add the following little NodeJS script to `littlebutton-vue/copystyles.js`:

```js
const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
const vue = fs.readFileSync("./src/components/Button.vue", "utf8");
// Take everything between the starting and closing style tag and replace
const styleRegex = /<style module>([\s\S]*?)<\/style>/;
let withSynchronizedStyles = vue.replace(styleRegex, `<style module>\n${css}\n</style>`);
fs.writeFileSync("./src/components/Button.vue", withSynchronizedStyles, "utf8");
```

So there's a bit more complexity in this NodeJS script, but using `replace` to copy text between opening and closing `style` tags via regex isn't too bad.

Let's then add the following to the `littlebutton-vue/package.json` scripts:


```json
"syncStyles": "node copystyles.js",
```

If you run `yarn syncStyles` and then look at `./src/components/Button.vue` again, you should see that our style module gets replaced with:

```css
<style module>
.btn {
  color: hotpink;
}
</style>
```

Run the Vue app again with `yarn serve` and verify you get the expected results — yes a button with hotpink text.

## Svelte

Per the [Svelte docs](https://svelte.dev/), we will kick off our `littlebutton-svelte` with the following from the monorepo's top-level directory:

```shell
npx degit sveltejs/template littlebutton-svelte
cd littlebutton-svelte
yarn && yarn dev
```
Confirm you can hit the hello world at http://localhost:5000. Then, update `littlebutton-svelte/src/App.svelte`:

```svelte
<script>
	import Button from './Button.svelte';
</script>
<main>
	<Button>Go</Button>
</main>
```

And `littlebutton-svelte/src/Button.svelte`: 
```svelte
<button class="btn">
  <slot></slot>
</button>
<script>
</script>
<style>
  .btn {
    color: saddlebrown;
  }
</style>
```


### Copy the CSS

Now we're going to write a similar node script we did for the React implementation that simply copies our `littlebutton-css/css/button.css` into our `Button.vue`. As mentioned, this component is a SFC so we're going to have to do this slightly differently using a simple [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

Add the following little NodeJS script to `littlebutton-vue/copystyles.js`:

```js
const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
const svelte = fs.readFileSync("./src/Button.svelte", "utf8");
const styleRegex = /<style>([\s\S]*?)<\/style>/;
let withSynchronizedStyles = svelte.replace(styleRegex, `<style>\n${css}\n</style>`);
fs.writeFileSync("./src/Button.svelte", withSynchronizedStyles, "utf8");
```

It's really quite similar to the copy script we used with Vue, isn't it? We'll just add the same `package.json` script:

```json
   "syncStyles": "node copystyles.js",
```

And then run `yarn syncStyles && yarn dev`. If all worked out, again, we have a button with pink text.


## Angular
- steps to generate angular app
- copystyles node script

## Make that button pop!

- Grab some common styles
https://github.com/AgnosticUI/agnosticui/blob/master/agnostic-css/css-dist/common.concat.css

- Grab some button styles
https://raw.githubusercontent.com/AgnosticUI/agnosticui/master/agnostic-css/button.css

- Add to index.html in css package and then run the copystyles

- Show setting up a CSS modules for React, and/or a SFC for VUE/Svelte, and View Encapsulation for Angular

## Conclusion

- Pimp AgnosticUI
- Bring up the shortcomings of copying from one workspace to another e.g. copystyles from `littlebutton-css/css/button.css` to `littlebutton-angular/foo/bar/baz/button.css`. Ask if they can think of any better alternatives that don't wreck the KISS thing we got goin' on.




A few years ago I authored a React-based &rdquo;Design System&ldquo; for the company I worked at and was feeling quite pleased with myself for doing it in just a few months. But then, within a couple of days of each other I 1. played with the Svelte playground, and 2. discussed with our new Singapore team's lead that his team was 2x productive in Angular then React. It immediately occured to me that I had written, yet another component library (I build a lot of these!)…but one that was absolutely coupled to React! So, if I wanted to preserve our newly codified brand design, I couldn't possibly do any pilot projects with my newly discovered Svelte, nor could the Singapore build an entirely orthogonal back-office application unrelated to our flagship product in what was familiar to them—Angular. I realized then and there that I never wanted to build another coupled component library, and, if I was going to build out another one of these, it was going to need to somehow be agnostic to frameworks.

One approach I could have taken was to fully invest myself in [web components](...) and I'd heard of [Ionic's compiler](...), but, it seemed at the time I was investigating things hard to get React to properly propogate events and what not. In any event, I elected to let it simmer and come back to it later when the time was right.

I'd used [CSS Modules](...) with React a lot in my career, and it occured to my that besides CSS Modules _composition_ technique, my components were pretty much just vanilla CSS. And I'd been moving towards using straight-up CSS with sprinkles of [PostCSS] processing in efforts to &ldquo;code towards a standard&rdquo;. I then learned the popular [SFC](...) approach that Svelte uses and how the CSS lives in the same file as the JavaScript. This didn't seem to me so antagonistic to how I was using CSS Modules (my `composes: foo from path/to/cssfile.css` was already pretty decoupled as I'd have one purely CSS component file, and another purely CSS modules composes file). So, I started to wonder if there was a way to go back to the days of designing UI components in pure HTML and CSS, and only then port those primitives over into a framework. Couldn't I continue to use CSS modules for React, and then simply copy the component CSS into my SFC? Then I learned Vue also uses SFC.

So then I wrote a little [NodeJS](...) script the simply copied styles into the SFC as a test. Kind of primitive, but it totally worked. And from this little experiment ignited my passion project [AgnosticUI](...). Let's replicate this technique to build a button component that works in HTML, React, Vue, Angular, and Svelte. We'll start in vanilla HTML/CSS.

EXAMPLE CODEPEN LINK

<p data-height="268" data-theme-id="0" data-slug-hash="raBZvv" data-default-tab="result" data-user="roblevin" class='codepen'>See the Pen <a href='http://codepen.io/roblevin/pen/raBZvv/'>Inline SVG Fill and Stroke </a> by Rob Levin (<a href='http://codepen.io/roblevin'>@roblevin</a>) on <a href='http://codepen.io'>CodePen</a>.</p>


