How do we make sure there is enough room to fit all the points?

See the png diagram in this folder to understand the terms in the the following.

The total width available for a single row of segments representing one wave and party group is:

```js
wavePartyAvailableWidth = vizWidth - 2 * partyGap - 3 * responseGap;
```

And the total area available for the points in a single row of segments representing one wave and party group is:

```js
waveHeight * wavePartyAvailableWidth;
```

Each point takes up `4*pointRadius**2` total area. So for a given `sampleSize`, we must have

```js
sampleSize * 4 * pointRadius ** 2 <=
  waveHeight * (vizWidth - 2 * partyGap - 3 * responseGap);
```

Let's say we set `responseGap = 2 * pointRadius` and `partyGap = 3 * pointRadius`. Then the above inequality becomes

```js
sampleSize * 4 * pointRadius ** 2 <= waveHeight * (vizWidth - 12 * pointRadius);
```

Now rearrange this expression as a lower bound on waveHeight:

```js
waveHeight >=
  (4 * sampleSize * pointRadius ** 2) / (vizWidth - 12 * pointRadius);
```

Now suppose we have

```js
sampleSize = 100;
pointRadius = 3;
vizWidth = 360;
```

Then the lowerBound on waveHeight becomes

```js
waveHeight >= 4 * 100 * 9 / (360 - 36)
= 3600 / 324
```

The ceiling of this fraction is 12.
