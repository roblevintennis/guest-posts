The Little Button That Could
The following is a guest post by Rob Levin. Rob is a Senior UI Engineer at CipherTrace of MasterCard, and author of AgnosticUI — a UI Component library that works in React, Vue, Angular, and Svelte. In this article, Rob shows you how a single `button.css` script can be used across multiple popular frameworks. In fact, this is the same technique Rob is using to implement AgnosticUI itself.


----------

Your mission — should you decide to accept it — is to build a Button component in four frameworks, but, only use one `button.css` file! 

This idea is very important to me. I’ve been working on a component library called AgnosticUI where the purpose is building UI components that aren’t tied to any one particular JavaScript framework. AgnosticUI works in React, Vue 3, Angular, and Svelte. So that’s exactly what we’ll do today in this article: build a component that works across all these frameworks.

/more

ILLUSTRATION HERE


    The source code for this article is at https://github.com/roblevintennis/guest-posts/tree/the-little-button-that-could-series on the `the-little-button-that-could-series` branch. 


Let's go monorepo!

We're going to set up a tiny yarn workspaces based monorepo.  I will defer to Chris Coyier’s Monorepo post which pretty fairly goes over what a monorepo is and some common pros and cons.

Here’s a perhaps biased list of benefits that I feel are relevant for our little buttons endeavor:

Coupling

To recap our goal—we’re trying to build a single button component that uses a just one `button.css` file—but does so across multiple frameworks. So, by nature, there’s some purposeful coupling going on between the various framework implementations and the single-source-of-truth CSS file.

Workflow

Time and time again, we will realize there's something faulty about that “focus-ring” implementation; or, we screwed up the use of `aria` in the component templates across all frameworks. Ideally, we’d like to correct such things in one go.

Testing

In our exercise, we want to be able to conveniently fire-up all 4 button implementations to spot check. As this sort of project grows, we'd likely add more proper testing of some form (in AgnosticUI, I'm currently using Storybook and will often just kick off all the framework Storybooks, or run snapshot testing across the entire monorepo).

I particularly like what Leonardo Losoviz said in From a Single Repo, to Multi-Repos, to Monorepo, to Multi-Monorepo which aligns with what I’ve claimed above:


> I believe the monorepo is particularly useful when all packages are coded in the same programming language, tightly coupled, and relying on the same tooling.


Let's go!

Time to dive into code—start by creating a top-level directory on the command-line to house the project and then `cd` into it (can’t think of a name? `mkdir buttons && cd buttons` will work fine).

package.json

First we'll initialize our top-level `package.json` with:


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

That gives us a `package.json` with something like:


    {
      "name": "littlebutton",
      "version": "1.0.0",
      "description": "my little button project",
      "main": "index.js",
      "author": "Rob Levin",
      "license": "MIT"
    }

Workspaces

Now let's start by creating our first workspace:


    mkdir -p ./littlebutton-css

Now add these two lines to your monorepo’s top-level `package.json` so we keep the monorepo itself private,. It will also declare our workspaces:


      ...
      "private": true,
      "workspaces": ["littlebutton-react", "littlebutton-vue", "littlebutton-svelte", "littlebutton-angular", "littlebutton-css"]

Now descend into the `littlebutton-css` directory. We'll again want to generate a `package.json` with `yarn init`. Since we've named our directory `littlebutton-css` (the same as how we specified it in our `workspaces` in `package.json`) we can just hit the return key and accept all the prompts:


    $ cd ./littlebutton-css && yarn init
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

At this point your directory structure should look like:


    ├── littlebutton-css
    │   └── package.json
    └── package.json

So we've only created the CSS package workspace at this point as we'll be generating our framework implementations with tools like `vite` which will generate a `package.json` and project directory for you. We will have to remember that the name we choose for these generated projects must match the name we’ve specified in the `package.json` for our `workspaces` earlier to work.

HTML & CSS

Let's stay in the `./littlebutton-css` workspace and create our simple button component using vanilla HTML and CSS — `touch` an `index.html` and a `./css/button.css` so that the file structure looks like this:


    ├── css
    │   └── button.css
    ├── index.html
    └── package.json

And let's just “connect the dots” with some boilerplate in `./index.html`:


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

And in `./css/button.css`:


    .btn {
      color: hotpink;
    }

Now open up that `index.html` page by double-clicking it to view it as a local `file://` resource in your browser. If you see an ugly generic button with `hotpink` text you've succeeded.

React

We're going to generate our React project using vite—a very lightweight and blazingly fast builder. Be forewarned that if you attempt to do this with `create-react-app`, there's a very good chance you will run into conflicts later with `react-scripts` and conflicting webpack or babel setups from other frameworks like Angular.

Let’s install our React workspace next. `cd` back up to your top-level directory and then we’ll use `vite` to initialize a new project which we’ll name `littlebutton-react` and of course we’ll select `react` as the framework and variant at the prompts:


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

Now follow the directions from above on the command-line (`cd littlebutton-react; yarn; yarn dev`), and confirm you see the generated React app.

With React installed and verified let's replace the contents of `src/App.jsx` to house our button with:


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

Copy the CSS

Now we're going to write a small node script to simply copy our `littlebutton-css/css/button.css` into our React application. This step is probably the most interesting one to me because it's both magical and ugly at the same time. It's magical, because it means our React button component is truly deriving its styles from the same CSS written in the html/css project. It's ugly because, well, we are reaching up out of one workspace and grabbing a file from another ¯\_(ツ)_/¯

Add the following little Node script to `littlebutton-react/copystyles.js`:


    const fs = require("fs");
    let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
    fs.writeFileSync("./src/button.css", css, "utf8");

Let's place a `node` command to run that in a `package.json` script that happens before the `dev` script in `littlebutton-react/package.json`. We'll add a `syncStyles` and update the `dev` to call `syncStyles` before `vite`:


        "syncStyles": "node copystyles.js",
        "dev": "yarn syncStyles && vite",

Now, anytime we fire up our React application with `yarn dev`, we'll first be copying the CSS file over. In essence, we're “forcing” ourselves to not diverge from the CSS package's `button.css` in our React button.

But we want to also leverage CSS Modules, so we have one more step to do to get that wired up (from the same `littlebutton-react` directory):


    touch src/button.module.css

And then add the following to our new `src/button.module.css`:


    .btn {
      composes: btn from './button.css';
    }

I find `composes` aka composition to be one of the coolest features of CSS Modules. In a nutshell, we're copying our HTML/CSS version of `button.css` over wholesale and then composing from our one `.btn` style rule.

With that, we can go back to our `src/App.jsx` and import the CSS Module `styles` into our React component with:


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

Whew! Let's finally now try to run our React app again:


    yarn dev

If all went well, you should see that same generic button, but with `hotpink` text.

Update the monorepo

Before we move on to the next framework, let's move back up to our top-level monorepo directory and update its `package.json` with:


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

Now in your terminal run `yarn` from top-level directory to get the monorepo hoisted dependencies installed.

The only change we’ve made to this `package.json` is that we’ve added a `scripts` section with a single script to start the React app. By adding `start:react` we can now run `yarn start:react` from our top-level directory and it will fire up the project we just built in `./littlebutton-react` without the need for `cd`'ing — super convenient!


    We'll tackle Vue and Svelte next. It turns out that we can take a pretty similar approach for both of these as they use Single File Components aka [SFC]. Basically, you get to mix HTML, CSS, and JavaScript all into one single file. Whether you like SFC or not, it's certainly adequate enough for building out presentational or primitive UI components.


Vue

Following the steps from the vite scaffolding docs we'll do the following from the monorepo top-level directory to initialize a vue app:


    yarn create vite littlebutton-vue --template vue

This will generate scaffolding with some provided instructions to run the starter Vue app:


      cd littlebutton-vue
      yarn
      yarn dev

You should see a page with something like `Hello Vue 3 + Vite`. Now update `src/App.vue` to:


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

And we'll replace any `src/components/*` with just `src/compontns/Button.vue`:


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

Let's break this down a bit.

- With the `:class="classes"` we're using Vue's binding to call the `computed` `classes` method.
- The `classes` method, in turn, is utilizing CSS Modules in Vue with the `this.$style.btn` syntax which will use styles from within `<style module>` tag.

For now, we're hard-coding `color: slateblue` simply to test we've got things working within the component properly. Try firing up the app again with `yarn dev`. If you see the purple text on the button it's working.

Copy the CSS

Now we're going to write a similar node script we did for the React implementation that simply copies our `littlebutton-css/css/button.css` into our `Button.vue`. As mentioned, this component is a SFC so we're going to have to do this slightly differently using a simple regular expression.

Add the following little NodeJS script to `littlebutton-vue/copystyles.js`:


    const fs = require("fs");
    let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
    const vue = fs.readFileSync("./src/components/Button.vue", "utf8");
    // Take everything between the starting and closing style tag and replace
    const styleRegex = /<style module>([\s\S]*?)<\/style>/;
    let withSynchronizedStyles = vue.replace(styleRegex, `<style module>\n${css}\n</style>`);
    fs.writeFileSync("./src/components/Button.vue", withSynchronizedStyles, "utf8");

So there's a bit more complexity in this NodeJS script, but using `replace` to copy text between opening and closing `style` tags via regex isn't too bad.

Let's then add the following two scripts to the `littlebutton-vue/package.json` scripts clause:


      "syncStyles": "node copystyles.js",
      "dev": "yarn syncStyles && vite",

If you run `yarn syncStyles` and then look at `./src/components/Button.vue` again, you should see that our style module gets replaced with:


    <style module>
    .btn {
      color: hotpink;
    }
    </style>

Run the Vue app again with `yarn dev` and verify you get the expected results — yes a button with hotpink text.

Svelte

Per the Svelte docs, we will kick off our `littlebutton-svelte` with the following from the monorepo's top-level directory:


    npx degit sveltejs/template littlebutton-svelte
    cd littlebutton-svelte
    yarn && yarn dev

Confirm you can hit the hello world at http://localhost:5000. Then, update `littlebutton-svelte/src/App.svelte`:


    <script>
        import Button from './Button.svelte';
    </script>
    <main>
        <Button>Go</Button>
    </main>

Also, in `littlebutton-svelte/src/main.js` you'll want to remove the `name` prop so it looks like this:


    import App from './App.svelte';
    
    const app = new App({
      target: document.body
    });
    
    export default app;

And finally, add `littlebutton-svelte/src/Button.svelte` with the following:


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

One last thing, Svelte appears to name your app: `"name": "svelte-app"` in the `package.json`. Change that to `"name": "littlebutton-svelte"` (so it's consistent with our top-level `package.json`'s `workspaces` name).

Copy the CSS

Now we're going to write a similar node script we did for the React implementation that simply copies our `littlebutton-css/css/button.css` into our `Button.vue`. As mentioned, this component is a SFC so we're going to have to do this slightly differently using a simple regular expression.

Add the following little NodeJS script to `littlebutton-svelte/copystyles.js`:


    const fs = require("fs");
    let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
    const svelte = fs.readFileSync("./src/Button.svelte", "utf8");
    const styleRegex = /<style>([\s\S]*?)<\/style>/;
    let withSynchronizedStyles = svelte.replace(styleRegex, `<style>\n${css}\n</style>`);
    fs.writeFileSync("./src/Button.svelte", withSynchronizedStyles, "utf8");

It's really quite similar to the copy script we used with Vue, isn't it? We'll just add similar scripts to our `package.json` script:


        "dev": "yarn syncStyles && rollup -c -w",
        "syncStyles": "node copystyles.js",

And then run `yarn syncStyles && yarn dev`. If all worked out, again, we have a button with pink text.

If this is starting to get repetitive all I have to say “welcome to my world” — you see, what I'm showing you here, is essentially the same process I've been using to build up AgnosticUI!


Angular

Once again, from the monorepo's top-level directory, install Angular (if needed) and create an Angular app. If we were creating a full-blown UI library we'd likely use `ng generate library` or even nx, but to keep things straight-forward we'll just set up a boilerplate Angular app as follows:


    npm install -g @angular/cli # unless you already have installed
    ng new littlebutton-angular # choose no for routing and CSS
    ? Would you like to add Angular routing? (y/N) N
    ❯ CSS 
      SCSS   [ https://sass-lang.com/documentation/syntax#scss ] 
      Sass   [ https://sass-lang.com/documentation/syntax#the-indented-syntax ] 
      Less   [ http://lesscss.org ]
    
    cd littlebutton-angular && ng serve --open

With Angular setup confirmed, let's update some files. `cd littlebutton-angular` and then delete the `src/app/app.component.spec.ts` file, and add a button component in `src/components/button.component.ts`:


    import { Component } from '@angular/core';
    
    @Component({
      selector: 'little-button',
      templateUrl: './button.component.html',
      styleUrls: ['./button.component.css'],
    })
    export class ButtonComponent {}

Add the following to `src/components/button.component.html`:


    <button class="btn">Go</button>

And the following to `src/components/button.component.css`:


    .btn {
      color: fuchsia;
    }

In `src/app/app.module.ts`:


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

Replace `src/app/app.component.ts` with:


    import { Component } from '@angular/core';
    
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css'],
    })
    export class AppComponent {}

Replace `src/app/app.component.html` with:


    <main>
      <little-button>Go</little-button>
    </main>

With that, let's run `yarn start` and verify our button with `fuchsia` text color renders.

Copy the CSS

Again, we want to copy over the CSS so create the following NodeJS script `littlebutton-angular/copystyles.js`:


    const fs = require("fs");
    let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
    fs.writeFileSync("./src/components/button.component.css", css, "utf8");

Angular turns out to be pretty simple as it uses ViewEncapsulation defaulting to `emulate` which emulates:


> …the behavior of shadow DOM by preprocessing (and renaming) the CSS code to effectively scope the CSS to the component's view.

Basically, this means we can literally just copy over `button.css` and use it as such.

Now just update the `package.json` adding two lines in the `scripts` section:


        "start": "yarn syncStyles && ng serve",
        "syncStyles": "node copystyles.js",

With that, let's run `yarn start` once more and verify our button (that was `fuchsia`) is now `hotpink`.


What have we just done?

Let's take a break from coding and think about the bigger picture and what we've just done. Basically, we've set up a system where any changes to our CSS package's `button.css` will get copied over into all the framework implementations as a result of our `copystyles.js` Node scripts. Further, we've incorporated idiomatic conventions for each of the frameworks:


- `SFC` for Vue and Svelte
- `CSS Modules` for React (and Vue within the SFC `<style module>` setup)
- `ViewEncapsulation` for Angular

Of course I state the obvious that these aren't the only ways to do CSS in each of the above frameworks (e.g. CSS-in-JS is a popular choice), but, they are certainly accepted practices and are working quite well for our greater goal—to have a single CSS source of truth to drive all framework implementations.

If for some reason, for example, our button was in use and our design team decided we wanted to change from `4px` to `3px` `border-radius`, we could update the one file, and any separate implementations would stay synced.

This is compelling if you have a polyglot team of developers that enjoy working in multiple frameworks, or, say an offshore team (that's 3x productive in Angular) that's being tasked to build a back-office application, but your flagship product was built in React. Or, you're building an interim Admin console and you'd love to experiment with using Vue or Svelte. You get the picture.

Update monorepo

Let's move back up to our top-level monorepo directory and update its `package.json` `scripts` section with the following so we can kick any framework implementation without `cd`'ing:


          ...
          "scripts": {
            "start:react": "yarn workspace littlebutton-react dev",
            "start:vue": "yarn workspace littlebutton-vue dev ",
            "start:svelte": "yarn workspace littlebutton-svelte dev",
            "start:angular": "yarn workspace littlebutton-angular start"
          },


Button styles

Let's update our button's base styles with something acceptable for a neutral default button. 
Update `littlebutton-css/css/button.css` with:


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

Now fire up each of the 4 framework implementations to confirm the changes worked (you should see a neutral gray button at this point). One CSS file update proliferated to four frameworks—pretty cool, eh!?

Primary mode

We're going to add a prop to our Button components `mode` and implement `primary` mode next. A primary
button could be any color but we'll go with a green primary. At the top of our

`littlebutton-css/css/button.css` where we define our main button `.btn` add:


    .btn {
      --button-primary: #14775d;
      --button-primary-color: #fff;
      ...

And then just before the `@media (prefers-reduced-motion)` stanza add the following `btn-primary` also in `littlebutton-css/css/button.css`:


    .btn-primary {
      background-color: var(--button-primary);
      border-color: var(--button-primary);
      color: var(--button-primary-color);
    }


Updating each component to take a `mode` property

Now that we've added our new mode `primary` represented by the `btn-primary` class we're going to want to sync the styles for all four of our framework implementations, so let's add some more `package.json` scripts to our top level `scripts` stanza (make sure to respect JSON's comma rules!):


        "sync:react": "yarn workspace littlebutton-react syncStyles",
        "sync:vue": "yarn workspace littlebutton-vue syncStyles",
        "sync:svelte": "yarn workspace littlebutton-svelte syncStyles",
        "sync:angular": "yarn workspace littlebutton-angular syncStyles"

Depending on where you place the above scripts within your `scripts: {…}` stanza, be sure you don’t have any missing commas and follow the rules for JSON.

Now go ahead and run the following to fully synchronize the styles:


    yarn sync:angular && yarn sync:react && yarn sync:vue && yarn sync:svelte

If you run these apps nothing will change because we haven't applied the primary class yet, but, if you go look at the framework's button component CSS you should at least see the CSS has been copied over.

React

For React, if you haven't already, double-check that the updated CSS got copied over into `littlebutton-react/src/button.css`. If not, you can run `yarn syncStyles`.

Note that if you forget to run `yarn syncStyles` our `dev` script will do this for us when we next start the application anyway:
    `"dev": "yarn syncStyles && vite",`
    
For our React implementation, we additionally will need to add a composed CSS Modules class in `littlebutton-react/src/button.module.css` which composed from the new `btn-primary`:


    .btnPrimary {
      composes: btn-primary from './button.css';
    }

We'll also update `littlebutton-react/src/App.jsx`:


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

Fire up the react app with `yarn start:react` from the top-level directory. If all went well, you should now see your green primary button.

I'm keeping the Button component in `App.jsx` for brevity, but feel free to tease out the Button component into its own file if that's bothering you.

Vue

Again, double-check your button styles got copied over to the Vue component’s  `littlebutton-vue/src/components/Button.vue`. If not, you can run `yarn syncStyles`.

Note that if you forget to run `yarn syncStyles` our `dev` script will do this for us when we next start the application anyway:
    `"dev": "yarn syncStyles && vite",`
    
Now make the following changes to the`<script>…</script>` section of `littlebutton-vue/src/components/Button.vue`:


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

With that, just update the use in `littlebutton-vue/src/App.vue` to use the new `mode` prop:


    <Button mode="primary">Go</Button>

Fire up the Vue app with `yarn start:vue` from the top-level directory. If all went well, you should now see your green primary button.

Svelte

Let’s change directory into `littlebutton-svelte` and verify you’re styles in `littlebutton-svelte/src/Button.svelte` have the new `btn-primary` class copied over else run `yarn syncStyles`. If not, you can run `yarn syncStyles`.

Note that if you forget to run `yarn syncStyles` our `dev` script will do this for us when we next start the application anyway:
   `"dev": "yarn syncStyles && rollup -c -w",`

Now we just need to update some Svelte JavaScript to apply the class when `mode` is passed in as `primary`—update `src/App.svelte` to:


    <script>
      import Button from './Button.svelte';
    </script>
    <main>
      <Button mode="primary">Go</Button>
    </main>

And update the top of your `src/Button.svelte` to:


    <button class="{classes}">
      <slot></slot>
    </button>
    <script>
      export let mode = "";
      const classes = [
        "btn",
        mode ? `btn-${mode}` : "",
      ].filter(cls => cls.length).join(" ");
    </script>

Note that the `<styles>` section of our Svelte component shouldn’t be touched. Now, fire up your app with `yarn dev` from `littlebutton-svelte` (or `yarn start:svelte` from a directory higher in your monorepo root).

Angular

If you haven't already, double-check that the updated CSS got copied over into `littlebutton-angular/src/components/button.css`. If not, you can run `yarn syncStyles`.

Note that if you forget to run `yarn syncStyles` our `dev` script will do this for us when we next start the application anyway:
   `"start": "yarn syncStyles && ng serve",`

In `littlebutton-angular/src/app/app.component.html` we’ll just add the `mode=``"``primary``"` prop:

    <main>
      <little-button mode="primary">Go</little-button>
    </main>

In `littlebutton-angular/src/components/button.component.html` we now need to set up a binding to classes that we will `compute` within the component. Below, note the binding is happening with the square brackets:


    <button [class]="classes">Go</button>

With the above change to our template, we need to actually create the `classes` binding in our component at `littlebutton-angular/src/components/button.component.ts`:


    import { Component, Input } from '@angular/core';
    
    @Component({
      selector: 'little-button',
      templateUrl: './button.component.html',
      styleUrls: ['./button.component.css'],
    })
    export class ButtonComponent {
      @Input() mode: 'primary' | undefined = undefined;
    
      public get classes(): string {
        const modeClass = this.mode ? `btn-${this.mode}` : '';
        return [
          'btn',
          modeClass,
        ].filter(cl => cl.length).join(' ');
      }
    }

We use the `Input` directive to take in the `mode` prop, and then we create a `classes` accessor which will add our mode class if it’s been passed in.
 
If you now fire up the app with `yarn start` in the `littlebutton-angular/` directory (or `yarn start:angular` from the top-level directory) you should see our updated primary button render.


Code complete

If you’ve made it this far, congratulations — you’ve reached code complete! If something went awry, I’d encourage you to cross-reference the GitHub source code: https://github.com/roblevintennis/guest-posts/tree/the-little-button-that-could-series on the `the-little-button-that-could-series` branch. As bundlers and packages have a tendency to change abruptly, you might want to pin your package versions to the ones from the above mentioned branch if you experience any dependency headaches.

Take a moment to go back and compare and contrast the 4 framework-based button component implementations you’ve just built. They’re still small enough to quickly notice some interesting differences in how props are passed, how they bind to props, how they prevent CSS name collisions, and other interesting contrasting yet similar approaches. As I continue to add components to AgnosticUI (which by-the-way supports these exact same four frameworks) I’m continually pondering which offers the best developer experience. What do you think?

Homework

If you're the type that likes to figure things out on your own or enjoys assignments, here are a couple of ideas:

Button states

The above button styles are not accounting for various states a button can be in. I believe that's a good first exercise for you to attempt. Start with this:


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

As you do this, I'd recommend you look at AgnosticUI's button's states, Bootstrap's button's states, and whatever other UI open source libraries you happen to like. I believe you'll find some overlap and code diving is a great way to learn and improve. If you see a line of code that's completely mysterious to you, simply google for an article on that style rule.

Variants

Most button libraries support many “button variants”. For example, sizes, shapes, color modes (we've added the mode `primary` for example; `secondary`, `action`, `warning`, `error`, `success` might be other plausible modes). Some CSS methodogies that may be helpful are: SMACSS which is mostly the methodology used in AgnosticUI, BEM, OOCSS, SuitCSS, and Atomic CSS. I'd also invite you to have a look at AgnosticUI's button.css for more ideas.

CSS custom properties

If you haven't started using CSS custom properties yet, I'd strongly recommend it. You can start by having a look at Agnostic's common styles. As you see, CSS custom properties are heavily leaned on. Here are some great articles that discuss
what custom properties are and how you might leverage them:

- A Complete Guide to Custom Properties
- A DRY Approach to Color Themes in CSS

Types—no…not typings, but the `type` attribute

Did you know buttons have a `type` attribute? Did you also know that if you can totally remove the “button look” with CSS and use `type=``"``button``"` for things that look like links but behave as buttons? That you can forever stop making anchor tags with `href=``"``#``"` thus angering the accessibility gods? Just kidding (kind of!). But seriously, it’s very useful to know that buttons aren’t only for form submissions—the valid types are: `button`, `submit`, and `reset`. This is pretty easy to add to your component and will greatly improve your button’s API.

More ideas

Gosh, you could do so much—add linting, convert it to Typescript, audit the accessibility, etc.

For example, our current Svelte implementation is suffering from some pretty loose assumptions as we have no defense if the `mode` passed in isn’t the valid `primary`—our `btn-${mode}` below bit; it would produce a garbage CSS class:


        mode ? `btn-${mode}` : "",

You could say “well, `btn-garbage` as a class isn’t exactly harmful”. But it’s probably a good idea to have intentional code when and where possible and this would be a motive to add types to the project.

Pitfalls

There are some pitfalls you should be aware of if you want to take this approach further:


- Positional CSS based on tag names and structure will not work well for the CSS Modules based techniques used here
- Angular makes positional techniques even harder as it generates a host element representing each component view. This means you have these extra elements in between in your template or markup structure. So you'll need to work around this.
- Copying styles across workspace packages is a bit of an anti-pattern to some folks. I justify this with the benefits outweigh the costs; and also, when I think about how monorepos are using symlinks, and “not-so-failproof” hoisting, and all the other magics of the coding world I don't feel so bad here.
- Of course you’ll have to subscribe to the decoupled techniques used here so no CSS-in-JS

I believe that all approaches to software development have their pros and cons and you have to weigh costs vs. benefits and ultimately use your own discretion to decide if this approach to sharing a single CSS file across frameworks works for you. There are certainly other ways you could do this (e.g. you could use `littlebuttons-css` as an npm package dependency and go that route)

Conclusion

Hopefully I’ve whet your appetite and you’re intrigued by the idea of creating UI component libraries and/or design systems that are not tied to a particular framework. Maybe you have a better idea on how to achieve this — I'd love to hear your thoughts in the comments if so.

I'm sure you've seen the venerable TodoMVC project and how many framework implementations have been created for it. Similarly, wouldn't it be nice to have a UI component library of primitives available for many frameworks? Open UI is making great strides to properly standardize native UI component defaults, but I believe we’ll always need to insert ourselves to some extent. Certainly, taking a good year to build a custom design system is quickly falling out of favor and company's are seriously questioning design system's ROI. Some sort of scaffolding is required to make the endeavor practical.

The vision of AgnosticUI is to have a framework agnostic way to build design systems quickly that are not tied down to a particular frontend framework. If you happen to feel compelled to get involved, the project is still very early and approachable. I’d certainly love some help! Plus, if you’ve went through the above tutorial, you basically now know exactly how AgnosticUI works!

The source code for this article is at https://github.com/roblevintennis/guest-posts/tree/the-little-button-that-could-series on the `the-little-button-that-could-series` branch. You can `git clone git@github.com:roblevintennis/guest-posts.git` and switch to that branch if you'd prefer to move faster or reference working code.
