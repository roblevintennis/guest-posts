![Explorations in SVG](./images/more-gotchas-svg.svg "Explorations in SVG")

<em class="explanation">The following is a guest post by Rob Levin and Chris Rumble. Rob and Chris both work on the product design team at <a href="https://medium.com/mavenlink-product-development">Mavenlink</a>. Rob is also creator and host of the [SVG Immersion Podcast](http://svgimmersion.com/) and wrote the original 5 Gotchas article in '14. Chris [ADD INTRO AND LINK HERE]. In this article, they go over some additional issues they encountered incorporating inline SVGs in to the production application over 2 years in.</em> 

Wow, it's been over 2 years since we posted the [5 Gotchas Getting SVG Into Production](https://css-tricks.com/gotchas-on-getting-svg-into-production/) article. Well, we've encountered some new gotchas making it time for another follow up post! We'll label these 6-10 paying homage to the first 5 gotchas in the original post :)

## Gotcha Six: IE Drag & Drop SVG Disappears

![SVG Disappears After Drag and Drop](./images/IE11-disappearing-svg-after-drag-ot.gif "Disappearing SVG in IE")

If you take a look at the animated gif above, you'll notice that I have a dropdown of task icons on the left, I attempt to drag the row outside of the sortable's container element, and then, when I drop the row back, the SVG icons have completely disappeared. This insidious bug didn't seem to happen on Windows 7 IE11 in my tests, but, did happen in Windows 10's IE11!  Although, in our example, the issue is happening due to use of a combination of [jQuery UI Sortable](https://jqueryui.com/sortable/) and the [nestedSortable plugin](https://github.com/ilikenwf/nestedSortable) (which needs to be able to drag items off the container to achieve the nesting, any sort of detaching of DOM elements and/or moving them in the DOM, etc., could result in this disappearing behavior. I wasn't able to find a Microsoft ticket at time of writing, but, if you have a setup available, you can see for yourself how this will happen in this simple [example](https://codepen.io/roblevin/pen/RgZJLd?editors=1010) which was forked from [fergaldoyle](https://github.com/fergaldoyle). The pen shows the same essential issue happening, but, this time when simlpy moving an element containing an SVG icon via JavaScript's `appendChild`.

A solution to this is to [reset the attribute](https://stackoverflow.com/questions/31900472/use-jquery-to-change-xlinkhref-attribute-of-svg-element/37667689#37667689) of any of the `<use>` elements upon said event completing. In my specific case of using Sortable, I was able to call the following method from inside Sortable's  `stop` callback:

```javascript
function ie11SortableShim(uiItem) {
  function shimUse(i, useElement) {
    if (useElement.href && useElement.href.baseVal) {
      // this triggers fixing of href for IE
      useElement.href.baseVal = useElement.href.baseVal;
    }
  }

  if (isIE11()) {
    $(uiItem).find('use').each(shimUse);
  }
};
```

I've left out the `isIE11` implementation, as it can be done a number of ways. But, the general idea is, find all the `<use>` elements in your container element, and then reassign their `href.baseVal` to trigger to IE to re-fetch those external `xlink:href`'s. Now, you may have an entire row of complex nested sub-views and may need to go with a more brute force approach. In my case, I also needed to do:
```javascript
  $(uiItem).hide().show(0);
```
to rerender the row—your mileage may vary ;)

If you're experiencing this outside of Sortable, you likely just need to hook in to some "after" event on whatever the parent/container element is, and then do the same sort of thing.

As I'm boggled by this IE11 specific issue, I'd love to hear if you've encountered this issue yourself, have any alternate solutions and/or greater understanding of the root IE issues, so do leave a comment if so.

## Gotcha Seven: IE Performance Boosts Replacing SVG4Everybody with Ajax Strategy

* Link to original css tricks article on using ajax instead of svg4everybody: https://css-tricks.com/ajaxing-svg-sprite/

* base section off https://twitter.com/roblevintennis/status/661343623645032448 
- work had ~15 sec IE11 page w/lots SVG icons & svg4everybody; used ur ajax er'thang-brought down to ~2 (for uncached first hit!)
- so, it works if you can Ajax SUPER fast so no flash-of-no-svg and/or you're page is already throwing up a spinner while preloading a bunch of SPA views anyhow, otherwise, consider just dumping the inline SVG defs (but loosing the cachability win)

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
