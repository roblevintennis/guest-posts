

<em class="explanation">The following is a guest post by Rob Levin and Chris Rumble. Rob and Chris both work on the product design team at <a href="https://medium.com/mavenlink-product-development">Mavenlink</a>. Rob is also creator and host of the [SVG Immersion Podcast](http://svgimmersion.com/) and wrote the original 5 Gotchas article in '14. Chris [ADD INTRO AND LINK HERE]. In this article, they go over some additional issues they encountered incorporating inline SVGs in to the production application over 2 years in.</em> 

Wow, it's been over 2 years since we posted the [5 Gotchas Getting SVG Into Production](https://css-tricks.com/gotchas-on-getting-svg-into-production/) article. Well, we've encountered some new gotchas making it time for another follow up post! We'll label these 6-10 paying homage to the first 5 gotchas in the original post :)

## Gotcha Six: IE Drag & Drop SVG Disappears

![SVG Disappears After Drag and Drop](./images/IE11-disappearing-svg-after-drag-ot.gif "Disappearing SVG in IE")

This insidious bug didn't seem to happen in Windows 7 from my tests, but, does happen in Windows 10 IE11. Although, in our example, the issue is happening due to use of a combination of [jQuery UI Sortable](https://jqueryui.com/sortable/) and the [nestedSortable plugin](https://github.com/ilikenwf/nestedSortable), any sort of detaching of DOM elements and/or moving them in the DOM, etc., may result in the SVG icon disappearing. I wasn't able to find a Microsoft ticket at time of writing, but you can see a simple [example](https://codepen.io/roblevin/pen/RgZJLd?editors=1010) which was forked from [fergaldoyle](https://github.com/fergaldoyle) that shows this behavior also happening when you literally move and element via JavaScript and `appendChild`.

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

## Gotcha Seven: IE Performance Boosts Replacing SVG4Everybody with Ajax Strategy
TBD

## Gotcha Eight: NonScaling Stroke From the Trenches
TBD

## Gotcha Nine: TBD
## Gotcha Ten: TBD

## Conclusion
TBD
