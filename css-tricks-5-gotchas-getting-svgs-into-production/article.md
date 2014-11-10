<em class="explanation">The following is a guest post by Rob Levin. Rob is a Senior UI/UX Developer at <a href="https://www.mavenlink.com/careers">Mavenlink</a>, and coauthor of the most popular <a href="https://github.com/unicorn-ui/Buttons/">CSS Button Library</a> on the web. In this article, Rob solves some of the problems you'll likely face when incorporating inline SVGs in to a production application for the first time.</em> 

#5 Gotchas Your Gonna Face Getting Inline SVG Into Production

You've read up on how inline SVG's are better than font icons and are ready to take the plunge. You call a meeting with your team to discuss moving over to inline SVG icons. Your boss is skeptical. He looks you in the eyes and says &ldquo;So, can you guarantee this isn't going to come back and bite us in the butt?&rdquo;. You hesitate a bit, but somehow conjure up the confidence to confirm, "Yes, this is definitely the direction we need to go!"

This was me just a couple months ago, and here are some &ldquo;gotchas&rdquo; I ran in to with corresponding workarounds. I'll start by examining the workarounds one by one, and then provide a working example at the end.

*Please note that this is not a persuasive article on why you should use inline SVG. For that, you should read this [popular css-tricks article](http://css-tricks.com/icon-fonts-vs-svg/) that points out the advantages of inline svg over icon fonts.*

## Gotcha One: Missing the Target

In order to achieve caching using an external SVG file (you seriously don't want to dump `~1.5kb * 50` icons on your page in a non-cacheable way right?!), you need to include the [svg4everybody](https://github.com/jonathantneal/svg4everybody) library on your page. Essentially, this shiv will use UA sniffing to detect if you're running a [&ldquo;problemattic version&rdquo;](https://github.com/jonathantneal/svg4everybody/blob/master/svg4everybody.js#L83) of IE or Android that doesn't properly cache external definitions files, and, if so, removes all `svg use` elements, and replaces them with embedded elements containing the corresponding SVG definition data pulled in via ajax. At the end of the day, we just care about the fact that our original SVG that might have looked like:

```html
<svg>
	<use xlink:href="/path/to/svgdef.svg#your-icon" … ></use>
</svg>
```

Will get replaced with an *embedded element* that looks something like this:

```html
<svg viewBox="0 0 16 16"><path> … </path></svg>
```

### CSS: Hitting the Target

Depending on the source SVG, you might end up with a hierarchy looking like: `svg path` (as above), or, it might be `svg g`, or possibly a combination of grouped and path descendants–but do remember, you'll need your CSS to target the &ldquo;pollyfilled&rdquo; cases–this means you're CSS rules should absolutely never target the `svg > use` element directly…it will get completely removed in IE!

### JavaScript: Hitting the Target

The same idea holds true for any JavaScript manipulations on the SVG clone itself. For example, we may want to [swap icons](http://css-tricks.com/swapping-svg-icons/) on a hover and–one technique we may choose–is to alter the `xlink:href` attribute with JavaScript when such an event fires. Since, in this article, we've elected to use an external file with the above described shim, we can't reliably use that technique (again, the `use` element gets replaced in IE). My recommendation is to just hide/show via CSS classes (Technique #1 described in [Swapping Out SVG Icons](http://css-tricks.com/swapping-svg-icons/) article), and be sure to target the SVG clone itself.

*If we're directly dropping in the inline SVG definition at the top of our page (ex. right after the opening `<body>` tag), we won't have this concern and using the technique of manipulating the `xlink:href` attribute is fine.*

### Selector Examples

Just to make the above points crystal clear, here's a CSS selector that would work in browsers that fully support external SVG definitions but fail in IE:

```css
.my-svg use {
	fill: red;}
```
It turns out there's no real need or gain to target `use`, so just change that to:
```css
.my-svg {
	fill: red;}
```
While we're talking about selectors, we should take this opportunity to point out you won't be able to &ldquo;reach in&rdquo; to original SVG definition with something like:
```css
svg.parent path.child { /* won't work! */ }
```
The same would apply to trying to style anything in the def itself be it a shape, path, group, etc. It may be obvious, but this is only an issue, here, because we're using the `use xlink:href` strategy.

## Gotcha Two: Working With A Designer

If your icons generally use only one color, applying the CSS styling in &ldquo;one sweep&rdquo; is trivial with: `fill: <your-color>`. For such cases, the designer on the project will need to be mindful to create the vector art applying only a fill with no stroke. In fact, even if you do want to apply a stroke to the SVG instance, it's probably easiest to do this if the source SVG was created with strokes turned off (fill only) in the vector application at creation time, since you'll be able to a stroke from CSS anyway. An example explains best…

<p data-height="268" data-theme-id="0" data-slug-hash="raBZvv" data-default-tab="result" data-user="roblevin" class='codepen'>See the Pen <a href='http://codepen.io/roblevin/pen/raBZvv/'>Inline SVG Fill and Stroke </a> by Rob Levin (<a href='http://codepen.io/roblevin'>@roblevin</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>



//Point 1. stroked instance is no longer styleable from instance
.stroked-instance {
  stroke: green;//nothing happens
  fill: red;//nada
}

//Point 2. but is from filled instance. Also, we can still apply a stroke
.filled-instance {
  stroke: #cc8ac1;
  stroke-width: 5px;
  fill: lighten(#cc8ac1, 20%);
}

//Point 3. You can always achieve an outlined effect by simply "turning off" the fill
.filled-instance-off {
  stroke: #d08aaf;
  stroke-width: 5px;
  fill: transparent;
}

//Point 4. If you want to apply stroke via CSS to the SVG exported with stroke and no fill, you have to target the shapes/paths within the source SVG in the defintion
symbol#completed-copy-stroked [stroke] {
  stroke: #dd6435;
  stroke-width: 5px;
}

//Point 5. You can also just add classes within the source SVG and apply CSS to those directly.
.ibestrokin {
  stroke: hotpink;
  stroke-width: 5px;
}
.istrokeittotheeast {
  stroke: green;
  stroke-width: 7px;
}









The opposite is also true, if what you're after is more of a *bordered outline* effect. In this case, the designer simply inverts the process, applying a stroke with no fill to the vector art. You'd style such an SVG with CSS like:

```css
.icon-bordered {
  stroke:  #ddd;
  stroke-width: 1px;
  fill: transparent;
}
```

The take away is that the fill/stroke approach taken, needs to be consistent between the vector art and the CSS applied.

TODO: Image example of solid filled vs. outlined


## Gotcha Three: Achieving Color Variation

One of the purported benefits of using SVG, in general, is the flexible style control we get since we can apply CSS to an SVG's *path*, *shape*, etc. However, using the `use xlink:href` mechanism results in a [non-exposed cloned DOM tree](http://www.w3.org/TR/SVG/struct.html#UseElement), for which our `fill` or `stroke` styles will apply to the referenced SVG *globally*. The implications of this, is that all cloned instances will share the same fill color.

Fortunately, there's a trick we can use to at least get one unique color per instance. If we go in to the SVG definition itself, we can apply `fill=“currentColor”` to a shape or path of our choosing. What does that do? Well, the long supported CSS value `currentColor`, specifies that color will be inherited. This means that we can define a font color higher up in the tree (for example on the cloned instances themselves), and the fill for that path or shape will inherit the color. I'm not sure who first thought of this, but I'll give credit to where I saw it first: [Jenna Smith's tweet](https://twitter.com/jjenzz/status/471308790521163776).

### Implementation
We start with our base fill which might look something like:

```css
.icon-primary {
  fill: #ccc;
  color: #3bafda;
}
```

Those classes would get dropped on the non-exposed `svg` clone instance:

```html
<svg class="icon-primary">…
```
Now here's where the magic starts to happen–our `fill` defines the icon's general fill color (in this case `#cc`), but now our font `color` defines the inherited accent color we defined as described above like:

```html
<path fill="currentColor" … />
```

![Preview of SVG icons](./images/current-color-example.png "Example of using `currentColor` to achieve an accent color on an SVG path")

In my testing, I found that IE9-11 have an issue that the `fill` that's defined on the `svg` itself, will take precedence over the inline `currentColor` that inherits from the font color. One workaround (ok, hack) that worked for me was to reapply it like:

```css
.icon-primary * [fill='currentColor'] {
  fill: currentColor;
}
```

This will take any sub-tree descendant of the `icon-primary` SVG and, if it has a the exact attribute `fill='currentColor'`, will override the `fill` definition. If you have a cleaner, tested way of achieving this, please do leave a comment.

If you're using [grunt-svgstore](https://github.com/FWeinb/grunt-svgstore) in your build process (the example at the end of this article does), you'll likely configure it to remove unwanted cruft via the `cleanup` property, and this library now [preserves fill attributes with the value `currentColor`](https://github.com/FWeinb/grunt-svgstore/commit/c9f2e08cac9159ac9a936cce5dc467eac9443f04#diff-04c6e90faac2675aa89e2176d2eec7d8R194)…so you don't have to worry about clobbering the custom attribute defined above. 

I've created a Sass mixin (purposely compatible down to 3.2) for doing this:

```sass
@mixin svgColors($fill: false, $color: false, $patchCurrentColorForIE: false) {
  @if $fill {
    fill: $fill;
  }
  @if $color {
    color: $color;
  }
  @if $patchCurrentColorForIE {
    * [fill='currentColor'] {
      fill: currentColor;
    }
  }
}
```

And I call it with something like:

```sass
.icon-primary {
  @include svgColors($neutralColor, $primaryColor, true);
}
```
If you're wondering about the `$patchCurrentColorForIE` parameter, I have that there for icons that won't require multiple colors, and thus don't need the shim applied.

### Other Color Variation Techniques

In addition to using the `currentColor` technique listed above, you can also use a `preserve--` attribute feature [now available in grunt-svgstore](https://github.com/FWeinb/grunt-svgstore#supplemental-features). How it works, is if you use `preserve--` as a prefix to any valid attribute in the source SVG, that attribute will be forced to remain in the resulting SVG (with the `preserve--` prefix removed). For example, `preserve--stroke` would result in just `stroke` in the outputed SVG definition.

Another technique to consider, if you're wondering how to achieve color variation–in this case for a `background-image`–is to take the approach of using a `data-uri` of an SVG, but first do a search and replace on the `fill` value as [described here](http://zslabs.com/articles/svg-background-fill). However, that approach is a bit out of scope and off-topic for this article, since it means using a non-cachable `data-uri` going against our primary goal to employ a cachable external SVG definitions file.

## Gotcha Four: jQuery Throws Error

If you've included jQuery on your page, clicking directly on a rendered `svg use` element will likely result in jQuery throwing an error that's documented in their [bug tracker](http://bugs.jquery.com/ticket/11352). It’s actually a bit tricky to reproduce this bug since you’ll likely have a containing block element that serves as an anchor or button–and that element will have the larger hit area–but, again, it happens if you click directly on the icon itself. Here's the preferred workaround:

```css
svg { pointer-events: none;}
```

Since `pointer-events` are *inherited*, this will cause any of the SVG &ldquo;sub-elements&rdquo; to also not respond to `pointer-events`. Once you've set this up, you should be mindful to ensure that any event handling (like a JavaScript `click` handler for example), is handled by an ancestor element and not the non-exposed SVG clone itself–a button or anchor are obvious examples of wrapper elements that would need to do the event handling in this case.

*If you do intend to handle mouse or pointer events on the SVG itself for animations or the like, you should probably consider just using an `img` or a CSS `background` tag for that particular SVG; doing so will make this a non-issue.*

## Gotcha Five: GitHub Diffs

One concern we had was that the SVG diffs are pretty archaic to a potential code reviewer. Chris Coyier pointed out to me that GitHub has recently deployed a sweet [svg viewing feature](https://github.com/blog/1902-svg-viewing-diffing) which allows you to toggle a view of the *blob*. Very handy.

![GitHub Supports SVG Diffs!](./images/svg-diff-animation.gif "GitHub Supports SVG Diffs!")

Additionally, a team-wide policy to keep such SVG work in a separate commits (so it doesn't *muddy* more meaningful code changes) is probably the pragmattic choice here.

##A Working Example

I've set up a &ldquo;toy example&rdquo; that you'll hopefully find helpful. It implements inline SVG using a [Grunt](http://gruntjs.com/) workflow, and relies on a cacheable external SVG definitions file. Note that this example does require IE9 and above.

*If you're not yet ready to set this up, [here's a demo page](http://unicorn-ui.com/buttons/svg-demo/) of what we'll be deploying.*

If you need to support IE8 and below, you can fallback to a png image of the same name as your SVG (but with the .png extension). Setting this up is described in the instructions for the [svg4everybody](https://github.com/jonathantneal/svg4everybody) library we're already using so start there.

To run the example you'll need the following installed:

* [nodejs](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
* [Ruby and Sass](http://sass-lang.com/install)

Run the following commands in your terminal to fetch the example and deploy it locally:

*Depending on how your system is set up, you may need to use `sudo` before the two `npm install` commands below*

```shell
#Install the Buttons example and set up npm dependencies
git clone -b svg-inline-experiments --single-branch https://github.com/unicorn-ui/Buttons.git Buttons && cd Buttons && npm install

#Install the SVG specific dependencies and run example
pushd svg-builder && npm install && grunt && popd && grunt dev
```

With these commands we:

* Clone the repository grabbing just the relevant `svg-inline-experiments` branch
* Install Buttons node dependencies
* Install SVG builder node dependencies
* Run our Grunt development workflow which builds the example's inline SVG definitions and also build the example page

Depending on your set up, the last step should result in opening up the following page in your system's default browser (if not, visit [http://localhost:8000](http://localhost:8000) manually):

![Preview of SVG icons](./images/two-instances.png "Preview of SVG icons–notice we have two instances pointing to same SVG def yet with different accent colors")

If you'd like to reverse engineer this set up in order to inform your own project's setup, the files you'll want to reference are:

- `styleguide/includes/svg.html` shows the markup used to create SVG instances
- `styleguide/scss/module/_svgs.scss` shows the CSS styling applied to our SVG icons
- `svg-builder/Gruntfile.js` a working Grunt configuration customized specifically for inline SVG
- `styleguide/pages/index.html` the only real thing you need to take note of in this file is that we include `svg4everybody.min.js`

## Conclusions

Having successfully addressed the above challenges, I'd assert that teams building modern web applications should definitely consider using inline SVG right now. [Unicorn-UI](http://unicorn-ui.com) is gearing up to implement an &ldquo;interactive playground&rdquo; for our recently released [Buttons 2.0 Beta](https://github.com/alexwolfe/Buttons), and, for obvious reasons, we'll definitely be utilizing inline SVG for that project…perhaps you should consider it for your next project too.
