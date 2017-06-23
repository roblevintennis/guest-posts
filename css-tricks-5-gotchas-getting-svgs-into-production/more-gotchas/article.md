

<em class="explanation">The following is a guest post by Rob Levin and Chris Rumble. Rob and Chris both work on the product design team at <a href="https://medium.com/mavenlink-product-development">Mavenlink</a>. Rob is also creator and host of the [SVG Immersion Podcast](http://svgimmersion.com/) and wrote the original 5 Gotchas article in '14. Chris [ADD INTRO AND LINK HERE]. In this article, they go over some additional issues they encountered incorporating inline SVGs in to the production application over 2 years in.</em> 

Wow, it's been over 2 years since we posted the [5 Gotchas Getting SVG Into Production](https://css-tricks.com/gotchas-on-getting-svg-into-production/) article. Well, we've encountered some new gotchas making it time for another follow up post! We'll label these 6-10 paying homage to the first 5 gotchas in the original post :)

## Gotcha Six: IE Drag & Drop SVG Disappears
TBD

## Gotcha Seven: IE Performance Boosts Replacing SVG4Everybody with Ajax Strategy
TBD

## Gotcha Eight: NonScaling Stroke From the Trenches
At Mavenlink we use svg’s for all our icons, by now you probably understand why and what the benefits are...so I’ll cut straight to the issue.
 
We were running into an issue where we were starting to need multiple sizes of our icons, which with svg is no problem right? Wrong. Our assets started looking blurry or too heavy for the various sizes we needed, it was super disappointing to realize that we might need multiple sizes of a scalable asset in-order to get the results we were looking for.

This just seemed wrong. We took a step back and tried to find a way to have crisp balanced assets while taking advantage of the strengths of SVG’s. The answer came in the form of strokes over fills, while this method won’t work for all icon styles, it was exactly what we needed.

Imagine you have a 10px x 10px icon with some 1px shapes and scale it to 15px those 1px shapes will now be 1.5px and the sharpness of your icons will be left up to how the viewers browser wants to render it. Not optimum.  

On the designery side we can also compare it to using a text typeface for titling instead of using a display typeface. It's gonna be clunky and misproportioned, too heavy for the use case. The proportions of a text face are designed to be used within a range of sizes good for long passages where as a display face is balanced for large and relitvely short "titles". 

The bottom line is using strokes gives you more control and better visual results. Heres an example of what I’m talking about.

![Strokes VS Fills](./images/strokes-vs-fills.png "Strokes VS Fills")

Putting it into action.

## Gotcha Nine: TBD
## Gotcha Ten: TBD

## Conclusion
TBD
