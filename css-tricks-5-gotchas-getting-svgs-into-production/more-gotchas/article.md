

<em class="explanation">The following is a guest post by Rob Levin and Chris Rumble. Rob and Chris both work on the product design team at <a href="https://medium.com/mavenlink-product-development">Mavenlink</a>. Rob is also creator and host of the [SVG Immersion Podcast](http://svgimmersion.com/) and wrote the original 5 Gotchas article in '14. Chris [ADD INTRO AND LINK HERE]. In this article, they go over some additional issues they encountered incorporating inline SVGs in to the production application over 2 years in.</em> 

Wow, it's been over 2 years since we posted the [5 Gotchas Getting SVG Into Production](https://css-tricks.com/gotchas-on-getting-svg-into-production/) article. Well, we've encountered some new gotchas making it time for another follow up post! We'll label these 6-10 paying homage to the first 5 gotchas in the original post :)

## Gotcha Six: IE Drag & Drop SVG Disappears

![SVG Disappears After Drag and Drop](./images/IE11-disappearing-svg-after-drag-ot.gif "Disappearing SVG in IE")

If you take a look at the animated gif above, you'll notice that I have a dropdown of task icons on the left, I attempt to drag the row outside of the sortable's container element, and then, when I drop the row back, the SVG icons have completely disappeared. This insidious bug didn't seem to happen on Windows 7 IE11 in my tests, but, did happen in Windows 10's IE11!  Although, in our example, the issue is happening due to use of a combination of [jQuery UI Sortable](https://jqueryui.com/sortable/) and the [nestedSortable plugin](https://github.com/ilikenwf/nestedSortable) (which needs to be able to drag items off the container to achieve the nesting, any sort of detaching of DOM elements and/or moving them in the DOM, etc., could result in this disappearing behavior. I wasn't able to find a Microsoft ticket at time of writing, but, if you have a setup available, you can see for yourself how this will happen in this simple [example](https://codepen.io/roblevin/pen/RgZJLd?editors=1010) which was forked from [fergaldoyle](https://github.com/fergaldoyle). This extremely simplified example shows the behavior happening when simlpy move an element containing and SVG icon via JavaScript's `appendChild`.

A solution to this is to [reset the attribute](https://stackoverflow.com/questions/31900472/use-jquery-to-change-xlinkhref-attribute-of-svg-element/37667689#37667689) of any of the `<use>` elements upon said event completing. In my specific case of using Sortable, I was able to do the following using it's `stop` callback method:

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
TBD

## Gotcha Eight: NonScaling Stroke From the Trenches
TBD

## Gotcha Nine: TBD
## Gotcha Ten: TBD

## Conclusion
TBD
