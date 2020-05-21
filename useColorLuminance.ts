import { useMemo } from 'react';

const RGBA_PATTERN = /rgba?\(([0-9]+),([0-9]+),([0-9]+)(?:,(1|0|0\.[0-9]*))?\)/;
const DEFAULT_THRESHOLD = 0.5;

/**
 * Premultiplied color:
 *
 * Supported formats for string input are:
 * - #rgb
 * - #rrggbb
 * - #rrggbbFF
 * - rgb(r, g, b)      (0 <= rgb <= 255)
 * - rgba(r, g, b, 1)  (0 <= rgb <= 255)
 *
 * Supported formats for array input are:
 * - [r, g, b]         (0 <= rgb <= 255)
 * - [r, g, b, 1]      (0 <= rgb <= 255)
 *
 * @example
 *
 *   '#333'
 *   '#fefefe'
 *   '#aeaeaeff'
 *   'rgb(127, 127, 255)'
 *   'rgba(32, 64, 87, 1)'
 *
 * @example
 *   [127, 127, 255]
 *   [32, 64, 87, 1]
 */
type PremultipliedColor =
  | string
  | [number, number, number]
  | [number, number, number, 1];

/**
 * Returns true if the given color is dark, false otherwise
 *
 * @param color
 * @param perceived
 * @param threshold
 *
 * @example
 *
 *   useIsColorDark('#333')
 */
export function useIsColorDark(
  color: PremultipliedColor,
  perceived?: true,
  threshold = DEFAULT_THRESHOLD
): boolean {
  return useColorLuminance(color, perceived) < threshold;
}

export function useColorLuminance(
  color: PremultipliedColor,
  perceived?: true
): number {
  return useMemo(() => colorLuminance(color, perceived), [color, perceived]);
}

/**
 * Calculates the color's luminance
 *
 * @param color #rgb, #rrggbb[FF], rgb(r,g,b), rgba(r,g,b,1) or [r, g, b]
 * @param perceived if false, uses sRGB luminance instead of perceived
 */
export function colorLuminance(
  color: PremultipliedColor,
  perceived?: true
): number {
  if (typeof color === 'string') {
    if (color[0] === '#') {
      const rgb = color.slice(1);
      if (rgb.length === 3) {
        return colorLuminance(
          [
            hexToByte(rgb[0] + rgb[0]),
            hexToByte(rgb[1] + rgb[1]),
            hexToByte(rgb[2] + rgb[2]),
          ],
          perceived
        );
      }

      if (rgb.length === 8) {
        const alpha = hexToByte(rgb.slice(6, 8));
        if (alpha !== 255) {
          throw new NotPremultiplied(color, alpha);
        }
      }

      if (rgb.length === 6 || rgb.length === 8) {
        return colorLuminance([
          hexToByte(rgb.slice(0, 2)),
          hexToByte(rgb.slice(2, 4)),
          hexToByte(rgb.slice(4, 6)),
        ]);
      }

      throw new UnsupportedFormat(color);
    }

    const matches = color.replace(/ /g, '').match(RGBA_PATTERN);

    if (matches) {
      if (matches[4] && matches[4] !== '1') {
        throw new NotPremultiplied(color, Number(matches[4]));
      }

      return colorLuminance(
        [Number(matches[1]), Number(matches[2]), Number(matches[3])],
        perceived
      );
    }

    throw new UnsupportedFormat(color);
  }

  assertRgbColor(color);

  return componentsToLuminance(
    color[0] / 255,
    color[1] / 255,
    color[2] / 255,
    !!perceived
  );
}

function hexToByte(hex: string): number {
  return parseInt(hex, 16) / 255;
}

function componentsToLuminance(
  r: number,
  g: number,
  b: number,
  perceived: boolean
) {
  if (perceived) {
    // https://www.w3.org/TR/AERT/#color-contrast
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  // https://en.wikipedia.org/wiki/Relative_luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function assertRgbColor(color: Exclude<PremultipliedColor, string>) {
  if (
    color.length < 3 ||
    color.length > 4 ||
    color.some((d) => d < 0 || d > 255)
  ) {
    throw new UnsupportedFormat(`[${color.join(', ')}]`);
  }

  if (color.length == 4 && color[3] !== 1) {
    throw new NotPremultiplied(`[${color.join(', ')}]`, color[3]);
  }
}

class UnsupportedFormat extends Error {
  constructor(color: string) {
    super(
      `
Expected color to be in a supported format, actual: ${color}.

Supported formats for string input are:

- #rgb
- #rrggbb
- #rrggbbFF
- rgb(r, g, b)      (0 <= rgb <= 255)
- rgba(r, g, b, 1)  (0 <= rgb <= 255)

Supported formats for array input are:

 - [r, g, b]         (0 <= rgb <= 255)
 - [r, g, b, 1]      (0 <= rgb <= 255)

Keyword/system colors are not supported (nor consistent across environments).
      `.trim()
    );
  }
}

class NotPremultiplied extends Error {
  constructor(color: string, alpha: number) {
    super(
      `
Expected a fully opaque color, actual: ${color}, with alpha: ${alpha}.

Colors with that are (semi-)translucent need to be pre-multiplied, which means
that you need to know the background color(s) in order to calculate the color
that will show on screen.

The package use-premultiplied-color has both a React hook as well as a general
utility function to premultiply colors.

  import { usePremultipliedColor } from 'use-premultiplied-color'

  const premultiplied = usePremultipliedColor(${color}, '#<background-color>')
  const luminance = useColorLuminance(${color})
      `.trim()
    );
  }
}
