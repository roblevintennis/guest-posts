*First I should mention that I'm using an experimental branch of Buttons to replicate my company setup (don't want a conflict of interest and I'm coauthor of Buttons so it's all good!) on the [svg-inline-experiments] branch. If you're curious to see what the multicolor icons might look like the following will open up demo page in browser locally:*

```shell
git clone git@github.com:alexwolfe/Buttons.git && cd Buttons/ && git fetch && git checkout svg-inline-experiments && npm install && grunt dev
```

Ok, here's my proposed outline…

#4 Gotchas Your Gonna Face Getting Inline SVG Into Production–Outline


##Setup–Boilerplate

* Introduce the topic and refer to pertinent css-tricks SVG articles from earlier this year
* Briefly list the libraries required with links
* Link to `[svg-inline-experiments]` branch for an example of the setup in the wild

*Each concept will be supported by a Pen, Gist, or git commit*

## Gotcha One: Caching in IE
svg4everybody and IE specific CSS (since svg4everybody removes the use / xlink elements we need two selectors)

## Gotcha Two: Achieving Color Variation

One of the purported benefits of SVG, in general, is the flexible style control when we peer in to the SVG to custom style paths, shapes, etc. However, with the whole use/xlink mechanism, we get a “non-exposed cloned DOM tree” and if we color the entire referenced SVG with, say a fill: red, all clone instances will have that color. However, we can use a trick if we inline defined fill=“currentColor” and then the clones can simply define their own font color and the referenced SVG will respect that choice.

More info on how above is achieved + [Jenna Smith attribution](https://twitter.com/jjenzz/status/471308790521163776)

## Gotcha Three: jQuery Throws Error

Clicking on an SVG element rendered via <use> results in jQuery throwing an error. It’s tricky to catch since you’ll likely have a containing anchor or button that will provide the bigger hit area, but you’ll sometimes see this if you manage to click right on to the SVG shape itself.

[jQuery Issue Reference](http://bugs.jquery.com/ticket/11352)
DELEGATE ON INLINE SVG WITH < USE > ELEMENT THROWS ERROR

```css
svg use { pointer-events: none;}
```

## Gotcha Four: Github Diffs

This is a small issue, but my team mate mentioned that while things like pngs, sprites, etc., show nice github diffs, the SVG diffs are pretty archaic to a code reviewer (we hadn’t provided any png fallback since we have a fairly aggressive browser “grade A” browser list to support). Solution was to use the grunt svg2png to create an unused directory of pngs, but that would show more visually what new icon, etc., was added. 

## Gotcha Five: Working With a Designer

Essentially, the issue here is that they should be informed (ahead of time) that you need them to create the vector art using fills and not strokes. Although you can style the SVG stroke directly, your svg use { fill will do nothing to strokes

## Extra Credit: SVG View Helper

Create an svg_icon helper if you’re going to be creating these all over the place


## Conclusions
I've decided to stick with it and it seems to be working now…so my TBD on this will be a recomendation to &ldquo;move forward&rdquo; with giving inline SVGs a go.