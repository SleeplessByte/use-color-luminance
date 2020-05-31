# use-color-luminance

Hooks to calculate color luminance and color contrasts.

## Installation

```bash
yarn add use-color-luminance
# assumes react is already installed
```

## Usage

Calculate the perceived luminance between 0 and 1:

```typescript
import { colorLuminance } from 'use-color-luminance';

colorLuminance('#fff');
// => 1

colorLuminance('#AA5522FF');
// => ~0.1516

colorLuminance([0, 255, 0]);
// => 0.7152
```

Calculate the contrast between two colors (between 1 and 21):

```typescript
import { contrast } from 'use-color-luminance';

contrast('#fff', '#000000');
// => 21

contrast('rgba(0, 0, 0, 1)', '#000');
// => 1

contrast('#00f', '#000');
// => 2.444
```

You can import `AA_THRESHOLD_CONTRAST`, `AAA_THRESHOLD_CONTRAST` if you want to compare the output with threshold values.

### Hooks

- `useColorLuminance` is the hook for `colorLuminance`

### Formats

Supported formats for string input are:

- `#rgb`
- `#rrggbb`
- `#rrggbbFF`
- `rgb(r, g, b)` _with `(0 <= rgb <= 255)`_
- `rgba(r, g, b, 1)` _with `(0 <= rgb <= 255)`_

Supported formats for array input are:

- `[r, g, b]` _with `(0 <= rgb <= 255)`_
- `[r, g, b, 1]` _with `(0 <= rgb <= 255)`_

### Opaque colors only

Calculating the luminance or contrast of a color, only works if it's fully opaque. In other words, they can not be translucent.

Colors with that are (semi-)translucent need to be alpha-blended, which means
that you need to know the background color(s) in order to calculate the color
that will show on screen.

The package `use-alpha-blended-color` has both a React hook as well as a general
utility function to blend colors.

```typescript
import { useAlphaBlendedColor } from 'use-alpha-blended-color';
```

**Note**: Even alpha blended colors might _not_ be fully opaque. An alpha blended color will **only** be fully opaque, if either the foreground or background is.
