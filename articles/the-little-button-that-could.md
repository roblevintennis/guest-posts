<em class="explanation">The following is a guest post by Rob Levin. Rob is a Senior UI Engineer at <a href="https://ciphertrace.com/">CipherTrace of MasterCard</a>, and author of <a href="https://github.com/AgnosticUI/agnosticui">AgnosticUI</a> — a UI Component library that works in [React](...), [Vue](...), [Angular](...), and [Svelte](...). In this article, Rob shows you how a single `button.css` script can be used across multiple popular frameworks. In fact, this is the same technique Rob is using to implement AgnosticUI itself.</em> 

# The Little Button That Could

Your mission should you decide to accept it is to build a Button component in four frameworks (TBD), but, only use one `button.css` file!

## Let's go monorepo!

_The source code for this article is at https://github.com/roblevintennis/guest-posts/tree/the-little-button-that-could-series on the `the-little-button-that-could-series` branch._

We're going to set up a tiny [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) based [monorepo](https://en.wikipedia.org/wiki/Monorepo). So create a top-level directory to house this project and `cd` into it.

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

Now let's start by creating our first workspace:

```shell
mkdir -p ./littlebutton-css
```

Now add these two lines to your monorepo’s top-level `package.json` so we keep the monorepo itself private,. It will also declare our workspaces:

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

At this point your directory structure should look like:

```shell
├── littlebutton-css
│   └── package.json
└── package.json
```

So we've only created the CSS package at this point as we'll be generating our framework implementations with tools like `vite` which will generate a `package.json` and project directory for you. We will have to remember that the name we choose for these generated projects must match the name we’ve specified in the `package.json` for our `workspaces` earlier to work.

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

_Note, we're going to generate our React project using [vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)—a very lightweight and blazingly fast builder. Be forwarned that if you attempt to do this with `create-react-app`, there's a very good chance you will run into conflicts later with `react-scripts` and conflicting Webpacks or Babels from other frameworks like Angular._

Let’s install our React workspace next:

```shell
$ yarn create vite
yarn create v1.22.15
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...

success Installed "create-vite@2.6.6" with binaries:
      - create-vite
      - cva
✔ Project name: … littlebutton-react
✔ Select a framework: › react
✔ Select a variant: › react

Scaffolding project in /Users/roblevin/workspace/opensource/guest-posts/articles/littlebutton-react...

Done. Now run:

  cd littlebutton-react
  yarn
  yarn dev

✨  Done in 17.90s.
```

Now follow the directions from above on the command-line and confirm you see the generated react app.

With React installed and verified let's update that `src/App.jsx` to house our button with:

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

Now we're going to write a small node script to simply copy our `littlebutton-css/css/button.css` into our React application. This step is probably the most interesting one to me because it's both magical and ugly at the same time. It's magical, because it means our React button component is truly deriving its styles from the same CSS written in the html/css project. It's ugly because, well, we are reaching up out of one workspace and grabbing a file from another ¯\_(ツ)_/¯

Add the following little NodeJS script to `littlebutton-react/copystyles.js`:

```js
const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
fs.writeFileSync("./src/button.css", css, "utf8");
```

Let's place a `node` command to run that in a `package.json` script that happens before the `dev` script in `littlebutton-react/package.json`. We'll add a `syncStyles` and update the `dev` to call `syncStyles` before `vite`:

```json
    "syncStyles": "node copystyles.js",
    "dev": "yarn syncStyles && vite",
```

Now, anytime we fire up our React application with `yarn dev`, we'll first be copying the CSS file over. In essence, we're &ldquo;forcing&rdquo; ourselves to not diverge from the CSS package's `button.css` in our React button.

But we want to also leverage [CSS Modules](https://github.com/css-modules/css-modules), so we have one more step to do to get that wired up (from the same `littlebutton-react` directory):

```shell
touch src/button.module.css
```

And then add the following to our new `src/button.module.css`:

```css
.btn {
  composes: btn from './button.css';
}
```

I find `composes` aka [composition](https://github.com/css-modules/css-modules#composition) to be one of the coolest features of CSS Modules. In a nutshell, we're copying our HTML/CSS version of `button.css` over wholesale, and then composing from our one `.btn` style rule.

With that, we can go back to our `src/App.jsx` and import the CSS Module `styles` into our React component with:

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
yarn dev
```

If all went well, you should see that same generic button, but with `hotpink` text.

## Update the monorepo

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
    "start:react": "yarn workspace littlebutton-react dev"
  }
}
```

Now in your terminal run `yarn` from top-level directory to get the monorepo hoisted dependencies installed.

All that we've added here is a `scripts` section. By adding `start:react` we can now run `yarn start:react` from our top-level directory and it will fire up the project we just built in `./littlebutton-react` without the need for `cd`'ing — super convenient! 

_We'll tackle Vue and Svelte next. It turns out that we can take a pretty similar approach for both of these as they use Single File Components aka [SFC]. Basically, you get to mix HTML, CSS, and JavaScript all into one single file. Whether you like SFC or not, it's certainly adequate enough for building out presentational or primitive UI components._


## Vue

Following the [vite scaffolding docs](https://vitejs.dev/guide/#scaffolding-your-first-vite-project) we'll do
the following from the monorepo top-level directory:

```shell
yarn create vite littlebutton-vue --template vue
```

This will generate scaffolding with some provided instructions to run the starter Vue app:

```shell
  cd littlebutton-vue
  yarn
  yarn dev
```

You should see a page with something like `Hello Vue 3 + Vite`.

Now update `src/App.vue` to:

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

And we'll replace any `src/components/*` with just `src/compontns/Button.vue`:

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

Let's break this down a bit.

-  With the `:class="classes"` we're using Vue's binding to call the `computed` `classes` method.
- The `classes` method, in turn, is utilizing [CSS Modules in Vue](https://vue-loader.vuejs.org/guide/css-modules.html#usage) with the `this.$style.btn` syntax which will use styles from within `<style module>` tag.

For now, we're hard-coding `color: slateblue` simply to test we've got things working within the component properly. Try firing up the app again with `yarn dev`. If you see the purple text on the button it's working.

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

Let's then add the following two scripts to the `littlebutton-vue/package.json` scripts clause:

```json
  "syncStyles": "node copystyles.js",
  "dev": "yarn syncStyles && vite",
```

If you run `yarn syncStyles` and then look at `./src/components/Button.vue` again, you should see that our style module gets replaced with:

```css
<style module>
.btn {
  color: hotpink;
}
</style>
```

Run the Vue app again with `yarn dev` and verify you get the expected results — yes a button with hotpink text.

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

Also, in `littlebutton-svelte/src/main.js` you'll want to remove the `name` prop so it looks like this:
```js
import App from './App.svelte';

const app = new App({
  target: document.body
});

export default app;
```

And finally, add `littlebutton-svelte/src/Button.svelte`: 
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

One last thing, Svelte appears to name your app: `"name": "svelte-app"` in the `package.json`. Change that to `"name": "littlebutton-svelte"` (so it's consistent with our top-level `package.json`'s `workspaces` name).
### Copy the CSS

Now we're going to write a similar node script we did for the React implementation that simply copies our `littlebutton-css/css/button.css` into our `Button.vue`. As mentioned, this component is a SFC so we're going to have to do this slightly differently using a simple [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

Add the following little NodeJS script to `littlebutton-svelte/copystyles.js`:

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
    "dev": "yarn syncStyles && rollup -c -w",
    "syncStyles": "node copystyles.js",
```

And then run `yarn syncStyles && yarn dev`. If all worked out, again, we have a button with pink text.

If this is starting to get repetitive all I have to say &ldquo;welcome to my world&rdquo; — you see, what I'm showing you here, is essentially the same process I've been using to build up [AgnosticUI](https://github.com/AgnosticUI/agnosticui)!

## Angular

Once again, from the monorepo's top-level directory, install Angular (if needed) and [create an Angular app](https://angular.io/guide/setup-local). If we were creating a full-blown UI library we'd likely use `ng generate library` or even [nx](https://nx.dev/l/a/tutorial/08-create-libs), but to keep things straight-forward we'll just set up a boilerplate Angular app as follows:

```shell
npm install -g @angular/cli # unless you already have installed
ng new littlebutton-angular # choose no for routing and CSS
? Would you like to add Angular routing? (y/N) N
❯ CSS 
  SCSS   [ https://sass-lang.com/documentation/syntax#scss ] 
  Sass   [ https://sass-lang.com/documentation/syntax#the-indented-syntax ] 
  Less   [ http://lesscss.org ]

cd littlebutton-angular && ng serve --open
```

With Angular setup confirmed, let's update some files. Delete the `src/app.component.spec.ts` file, and add a button component in `src/components/button.component.ts`:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'little-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {}
```

Add the following to `src/components/button.component.html`:
```html
<button class="btn">Go</button>
```

And the following to `src/components/button.component.css`:
```css
.btn {
  color: fuchsia;
}
```

- Add the button to the app module

In `src/app/app.module.ts`:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ButtonComponent } from '../components/button.component';

@NgModule({
  declarations: [AppComponent, ButtonComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Replace `src/app/app.component.ts` with:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
```

Replace `src/app/app.component.html` with:
```html
<main>
  <little-button>Go</little-button>
</main>
```

With that, let's run `yarn start` and verify our button with `fuchsia` text color renders.

### Copy the CSS

Again, we want to copy over the CSS so create the following NodeJS script `littlebutton-angular/copystyles.js`:

```js
const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
fs.writeFileSync("./src/components/button.component.css", css, "utf8");
```

Angular turns out to be pretty simple as it uses [ViewEncapsulation](https://angular.io/guide/view-encapsulation) defaulting to `emulate` which emulates:

> …the behavior of shadow DOM by preprocessing (and renaming) the CSS code to effectively scope the CSS to the component's view.

Basically, this means we can literally just copy over `button.css` and use it as such.

Now just update the `package.json` adding two lines in the `scripts` section:

```json
    "start": "yarn syncStyles && ng serve",
    "syncStyles": "node copystyles.js",
```

With that, let's run `yarn start` once more and verify our button with `fuchsia` text color renders.

## What have we just done?

Let's take a break from coding and think about the bigger picture and what we've just done. Basically, we've set up a system where any changes to our CSS package's `button.css` will get copied over into all the framework implementions as a result of our `copystyles.js` NodeJS scripts. Further, we've incorporated idiomatic conventions for each of the frameworks:

- `SFC` for Vue and Svelte
- `CSS Modules` for React (and Vue within the SFC `<style module>` setup)
- `ViewEncapsulation` for Angular

Of course I state the obvious that these aren't the only ways to do CSS in each of the above frameworks (e.g. CSS-in-JS is a popular choice), but, they are certainly accepted practices and are working quite well for our greater goal—to have a single CSS source of truth to drive all framework implementations.

If for some reason, for example, our button was in use and our design team decided we wanted to change from `4px` to `3px` `border-radius`, we could update the one file, and any separate implementations would stay synced.

This is compelling if you have a polyglot team of developers that enjoy working in multiple frameworks, or, say an offshore team (that's 3x productive in Angular) that's being tasked to buidl a back-office application, but your flagship product was built in React. Or, you're building an interim Admin console and you'd love to experiement with using Vue or Svelte. You get the picture.

## Update Monorepo

Let's move back up to our top-level monorepo directory and update its `package.json` `scripts` section with the following so we can kick any framework implementation without `cd`'ing:

```json
      ...
      "scripts": {
        "start:react": "yarn workspace littlebutton-react start",
        "start:vue": "yarn workspace littlebutton-vue dev ",
        "start:svelte": "yarn workspace littlebutton-svelte dev",
        "start:angular": "yarn workspace littlebutton-angular start"
      },
```

## Button Styles

Let's update our button's base styles with something acceptable for a neutral default button. Update `littlebutton-css/css/button.css` with:

```css
.btn {
  --button-dark: #333;
  --button-line-height: 1.25rem;
  --button-font-size: 1rem;
  --button-light: #e9e9e9;
  --button-transition-duration: 200ms;
  --button-font-stack:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Ubuntu,
    "Helvetica Neue",
    sans-serif;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
  transition-property: all;
  transition-duration: var(--button-transition-duration);
  color: var(--button-dark);
  background-color: var(--button-light);
  border-color: var(--button-light);
  border-style: solid;
  border-width: 1px;
  font-family: var(--button-font-size);
  font-weight: 400;
  font-size: var(--button-font-size);
  line-height: var(--button-line-height);
  padding-block-start: 0.5rem;
  padding-block-end: 0.5rem;
  padding-inline-start: 0.75rem;
  padding-inline-end: 0.75rem;
  text-decoration: none;
  text-align: center;
  outline: none;
}

/* Respect users reduced motion preferences */
@media (prefers-reduced-motion) {
  .btn {
    transition-duration: 0.001ms !important;
  }
}
```

Now fire up each of the 4 framework implementations to confirm the changes worked.

## Primary mode

We're going to add a prop to our Button components `mode` and implement `primary` mode next. A primary
button could be any color but we'll go with a green primary. At the top of our
`littlebutton-css/css/button.css` where we define our main button `.btn` add:

```css
.btn {
  --button-primary: #14775d;
  --button-primary-color: #fff;
  ...
```

And then just before the `@media (prefers-reduced-motion)` stanza add the following `btn-primary` also in `littlebutton-css/css/button.css`:

```css
.btn-primary {
  background-color: var(--button-primary);
  border-color: var(--button-primary);
  color: var(--button-primary-color);
}
```


## Updating each component to take a `mode` property

Now that we've added our new mode `primary` represented by the `btn-primary` class we're going to want to sync the styles for all four of our framework implementations, so let's add some more `package.json` scripts to our top level `scripts` stanza (make sure to respect JSON's comma rules!):

```json
    "sync:react": "yarn workspace littlebutton-react syncStyles",
    "sync:vue": "yarn workspace littlebutton-vue syncStyles",
    "sync:svelte": "yarn workspace littlebutton-svelte syncStyles",
    "sync:angular": "yarn workspace littlebutton-angular syncStyles"
```

Now go ahead and run the following to fully synchronize the styles:

```shell
yarn sync:angular && yarn sync:react && yarn sync:vue && yarn sync:svelte
```

If you run these apps nothing will change because we haven't applied the primary class yet, but, if you go look at the framework's button component CSS you should at least see the CSS has been copied over.
### React

For React, if you haven't already, double-check that the updated CSS got copied over into `littlebutton-css/css/button.css`. If so, we'll also need to add a composed class in `littlebutton-react/css/button.module.css` which points to the new `btn-primary`:

```css
.btnPrimary {
  composes: btn-primary from './button.css';
}
```

We'll also update `littlebutton-react/src/App.jsx`:

```jsx
import "./App.css";
import styles from "./button.module.css";

const Button = ({ mode }) => {
  const primaryClass = mode ? styles[`btn${mode.charAt(0).toUpperCase()}${mode.slice(1)}`] : '';
  const classes = primaryClass ? `${styles.btn} ${primaryClass}` : styles.btn;
  return <button className={classes}>Go</button>;
};

function App() {
  return (
    <div className="App">
      <Button mode="primary" />
    </div>
  );
}

export default App;
```

Fire up the react app with `yarn start:react` from the top-level directory. If all went well, you should now see your green primary button.

_I'm keeping the Button component in `App.jsx` for brevity, but feel free to tease out the Button component into its own file if that's bothering you._

### Vue

Again, double-check your button styles got copied over to the Vue component. If so, you'll make the following changes to the script section of `littlebutton-vue/src/components/Button.vue`:

```vue
<script>
export default {
  name: 'Button',
  props: {
    mode: {
      type: String,
      required: false,
      default: '',
      validator: (value) => {
        const isValid = ['primary'].includes(value);
        if (!isValid) {
          console.warn(`Allowed types for Button are primary`);
        }
        return isValid;
      },
    }
  },
  computed: {
    classes() {
      return {
        [this.$style.btn]: true,
        [this.$style['btn-primary']]: this.mode === 'primary',
      }
    }
  }
}
</script>
```

With that, just update the use in `littlebutton-vue/src/App.vue` to use the new `mode` prop:

```html
  <Button mode="primary">Go</Button>
```

Fire up the Vue app with `yarn start:vue` from the top-level directory. If all went well, you should now see your green primary button.

### Svelte

### Angular


## Homework

If you're the type that likes to figure things out on your own or enjoys assignments, here are a couple of ideas:

### Button States

The above button styles are not accounting for various states a button can be in. I believe that's a good
first exercise for you to attempt. Start with this:


```css
/* You should really implement the following states but I will leave it
as an exercise for you to decide how to and what values to use. */
.btn:focus {
  /* If you elect to remove the outline, please ensure you replace it with another proper
  affordance and also research how to use transparent outlines to support windows high contrast */
}
.btn:hover { }
.btn:visited { }
.btn:active { }
.btn:disabled { }
```

As you do this, I'd recommend you look at [AgnosticUI's button's states](https://github.com/AgnosticUI/agnosticui/blob/master/agnostic-css/src/components/button/button.css#L49), [Bootstrap's button's states](https://github.com/twbs/bootstrap/blob/main/scss/_buttons.scss#L22), and whatever other UI open source libraries you happen to like. I believe you'll find some overlap and code diving is a great way to learn and improve. If you see a line of code that's completely mysterious to you, simply google for an article on that style rule.

### Variants

Most button libraries support many &ldquo;button variants&rdquo;. For example, sizes, shapes, color modes (we've added the mode `primary` for example; `secondary`, `action`, `warning`, `error`, `success` might be other plausible modes). Some CSS methodogies that may be helpful are: [SMACSS](http://smacss.com/) which is mostly the methodology used in AgnosticUI, [BEM](http://getbem.com/introduction/), [OOCSS](http://oocss.org/), [SuitCSS](http://suitcss.github.io/), and [Atomic CSS](https://acss.io/). I'd also invite you to have a look at [AgnosticUI's button.css](https://raw.githubusercontent.com/AgnosticUI/agnosticui/master/agnostic-css/button.css) for more ideas.
### CSS Properties

If you haven't started using CSS custom properties yet, I'd strongly recommend it. You can start by having a look at Agnostic's [common styles](https://github.com/AgnosticUI/agnosticui/blob/master/agnostic-css/css-dist/common.concat.css). As you see, CSS custom properties are heavily leaned on. Here are some great articles that discuss
what custom properties are and how you might leverage them:
- [A Complete Guide to Custom Properties](https://css-tricks.com/a-complete-guide-to-custom-properties/)
- [A DRY Approach to Color Themes in CSS ](https://css-tricks.com/a-dry-approach-to-color-themes-in-css/)

## Pitfalls

There are some pitfalls you should be aware of if you want to take this approach further:

- Positional CSS based on tag names and structure will not work well for the CSS Modules based techniques used here
- Angular makes positional techniques even harder as it generates a [host](https://angular.io/guide/component-styles#host) element representing each component view. This means you have these extra elements in between in your template or markup structure. So you'll need to work around this.
- Copying styles across workspace packages is a bit of an anti-pattern. I justify this with the benefits outweigh the costs; and also, when I think about how monorepos are using symlinks, and &ldquo;not-so-failproof&rdquo; hoisting, and all the other magics of the coding world I don't feel so bad here.
- Of course you’ll have to subscribe to the decoupled techniques used here so no CSS-in-JS

I believe that all approaches to software development have their pros and cons and you have to weigh costs vs. benefits and ultimately use your own discretion to decide if this approach to sharing a single CSS file across frameworks works for you. There are certainly other ways you could do this (e.g. you could use `littlebuttons-css` as an npm package dependency and go that route as well)

## Conclusion

Hopefully I’ve whet your appetite and you’re intrigued by the idea of creating UI component libraries and/or design systems that are not tied to a particular framework. Maybe you have a better idea on how to achieve this — I'd love to hear your thoughts in the comments if so.

I'm sure you've seen the venerable [TodoMVC](https://todomvc.com) project and how many framework implementations have been created for it. Similarly, wouldn't it be nice to have a UI component library of primitives available for many frameworks? Taking a good year to build a custom design system is quickly falling out of favor and company's are seriously questioning design system's ROI.

The vision of [AgnosticUI](https://github.com/AgnosticUI/agnosticui) is to have a framework agnostic way to build design systems quickly that are not tied down to a particular framework. If you happen to feel compelled to get involved, the project is still very early and approachable and I’d certainly love some help. Plus, if you’ve went through the above tutorial, you basically now know exactly how AgnosticUI works!

_The source code for this article is at https://github.com/roblevintennis/guest-posts/tree/the-little-button-that-could-series on the `the-little-button-that-could-series` branch. You can `git clone git@github.com:roblevintennis/guest-posts.git` and switch to that branch if you'd prefer to move faster or reference working code._
