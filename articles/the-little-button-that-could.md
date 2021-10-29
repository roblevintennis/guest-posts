<em class="explanation">The following is a guest post by Rob Levin. Rob is a Senior UI Engineer at <a href="https://ciphertrace.com/">CipherTrace of MasterCard</a>, and author of <a href="https://github.com/AgnosticUI/agnosticui">AgnosticUI</a> — a UI Component library that works in [React](...), [Vue](...), [Angular](...), and [Svelte](...). In this article, Rob shows you how a single `button.css` script can be used across multiple popular frameworks. In fact, this is the same technique Rob is using to implement AgnosticUI itself.</em> 

# The Little Button That Could

Your mission should you decide to accept it is to build a Button component in four frameworks (TBD), but, only use one `button.css` file!

## Let's go monorepo!

We're going to set up a tiny `yarn workspaces` monorepo.

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
mkdir -p ./littlebutton-react ./littlebutton-vue littlebutton-svelte littlebutton-angular littlebutton-css
$ tree . # you don't need to do this but just showing you what things should look like:
├── littlebutton-angular
├── littlebutton-css
├── littlebutton-react
├── littlebutton-svelte
├── littlebutton-vue
├── package.json
```

Now add these two lines to your top-level `package.json` so we keep the monorepo itself private, and have our workspaces setup:

```json
  ...
  "private": true,
  "workspaces": ["littlebutton-react", "littlebutton-vue", "littlebutton-svelte", "littlebutton-angular", "littlebutton-css"]
```


TODO -- MIGHT NOT WANT TO GENERATE package.json FILES -- e.g. create-react-app wants to generate it for you


Now descend into each of these directories and generate a `package.json` for each with `yarn init` again. Since we've named our directories the same as how we specified our `workspaces` in `package.json` (they have to be the same name!) we can just rapid-fire hit that return key and accept all the prompts:

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
│   └── package.json
├── littlebutton-css
│   └── package.json
├── littlebutton-react
│   └── package.json
├── littlebutton-svelte
│   └── package.json
├── littlebutton-vue
│   └── package.json
└── package.json
```

## HTML &amp CSS

Let's descend into the `./littlebutton-css` workspace and create our simple button component using vanilla HTML and CSS — `touch` an `index.html` and a `./css/button.css` so that you're CSS workspace file structure looks like this:

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

Now open up that `index.html` page by double-clicking it to view it as a `file://` resource in your browser. If you see an ugly button with `hotpink` text you've succeeded.

_Now, I could spend a long time showing you how to style a button, but, ahem, I'm pretty sure you should just have a look at [A Complete Guide to Links and Buttons](https://css-tricks.com/a-complete-guide-to-links-and-buttons/) which has exhaustive information on the matter. Our goal today is to get our little button working across 4 frameworks. I'll get you some nice styling resources to just drop in towards the end of the article. Onwards._

## React

TODO --- make sure we've updated the article to NOT create a package.json in littlebutton-react before running upcoming commands!

We'll go ahead and utilize `create-react-app` to kick off a React application; from the top-level directory do:

```shell
# See https://create-react-app.dev/docs/getting-started/#quick-start
cd littlebutton-react && npx create-react-app . && yarn start
```

Your system default browser should automatically open to `http://localhost:3000` and you should see the default React application.

With React installed, let's update that `App.js` to house our button with:

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

Now, anytime we fire up our React application with `yarn start`, we'll first be copying the CSS file over. In essence, we're &ldquo;forcing$rdquo; ourselves to not diverge from the CSS package in our React application.

But we want to leverage [CSS Modules](https://github.com/css-modules/css-modules), so we have one more step to do to get that wired up (from the `littlebutton-react` directory still):

```shell
touch button.module.css
```

The Webpack configuration that `create-react-app` ships with is set up to consider anything with the `*.module.[sc]ss` extension as a CSS modules. With that, open up that `button.module.css` and write:

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

Whew! Ok, let's finally now try to run things:

```shell
yarn start
```

If all went well, you should see that same generic button, but with `hotpink` text. Mind blown? Didn't think so — the button's too ugly for you…I get it. But we're doing UDD—ugly-driven development and, sorry, but we're not make things look pretty until the very end. In fact, we're done with the React setup for now. Onwards.

## Vue &amp; Svelte

So we'll tackle Vue and Svelte next. It turns out that we can take a pretty similar approach for both of these as they use [Single File Components](https://vuejs.org/v2/guide/single-file-components.html) aka [SFC]. Basically, you get to mix HTML, CSS, and JavaScript all into one single file. Whether you like SFC or not, it's certainly adequate enough for building out presentational or primitive UI components.

- steps to generate vue app
- copystyles node script
- steps to generate svelte app
- copystyles node script

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


