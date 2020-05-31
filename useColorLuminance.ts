import { useMemo } from 'react';

const RGBA_PATTERN = /rgba?\(([0-9]+),([0-9]+),([0-9]+)(?:,(1|0|0?\.[0-9]*))?\)/;
const LUMINANCE_DARK_THRESHOLD = 0.35;

export const AA_THRESHOLD_CONTRAST = 4.5;
export const AAA_THRESHOLD_CONTRAST = 7.0;
export const AA_LARGE_SIZE_THRESHOLD_CONTRAST = 3.0;
export const AAA_LARGE_SIZE_THRESHOLD_CONTRAST = 4.5;

/**
 * Opaque color:
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
export type OpaqueColor =
  | string
  | [number, number, number]
  | [number, number, number, 1];

/**
 * Returns true if the given color has a lower luminance than threshold (default
 * is 0.35), false otherwise.
 *
 * Prefer {useContrast} or {useHasContrastOnLight} because it's will determine
 * if a color is dark enough to have contrast with the background color.
 *
 * @param color
 * @param threshold
 *
 * @see useContrast
 * @see useHasContrastOnLight
 *
 * @example
 *
 *   useIsColorDark('#333')
 */
export function useIsColorDark(
  color: OpaqueColor,
  threshold = LUMINANCE_DARK_THRESHOLD
): boolean {
  return useColorLuminance(color) < threshold;
}

/**
 * Calculates the contrast between two colors
 *
 * @param color the foreground color
 * @param background the background color
 *
 * @returns the contrast 1:<result> between 1 and 21
 */
export function useContrast(
  color: OpaqueColor,
  background: OpaqueColor
): number {
  return useMemo(() => contrast(color, background), [color, background]);
}

/**
 * Calculates the contrast between two colors
 *
 * @param color the foreground color
 * @param background the background color
 *
 * @returns the contrast 1:<result> between 1 and 21
 */
export function contrast(color: OpaqueColor, background: OpaqueColor) {
  const la = colorLuminance(color);
  const lb = colorLuminance(background);

  const [l2, l1] = [la, lb].sort();

  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Returns true if the color has at least an AA contrast with the background, if
 * the background is white.
 *
 * @param color
 * @param background defaults to white (#fff)
 * @param threshold {AA_THRESHOLD_CONTRAST}
 *
 * @see AA_THRESHOLD_CONTRAST
 * @see AA_LARGE_SIZE_THRESHOLD_CONTRAST
 * @see AAA_THRESHOLD_CONTRAST
 * @see AAA_LARGE_SIZE_THRESHOLD_CONTRAST
 */
export function useHasContrastOnLight(
  color: OpaqueColor,
  background: OpaqueColor = '#ffffff',
  threshold = AA_THRESHOLD_CONTRAST
) {
  return useContrast(color, background) > threshold;
}

/**
 * Returns true if the color has at least an AA contrast with the background, if
 * the background is black.
 *
 * @param color
 * @param background defaults to black (#fff)
 * @param threshold {AA_THRESHOLD_CONTRAST}
 *
 * @see AA_THRESHOLD_CONTRAST
 * @see AA_LARGE_SIZE_THRESHOLD_CONTRAST
 * @see AAA_THRESHOLD_CONTRAST
 * @see AAA_LARGE_SIZE_THRESHOLD_CONTRAST
 */
export function useHasContrastOnDark(
  color: OpaqueColor,
  background: OpaqueColor = '#000000',
  threshold = AA_THRESHOLD_CONTRAST
) {
  return useContrast(color, background) > threshold;
}

/**
 * Gives the color luminance (as a hook)
 * @param color the color
 * @returns luminance
 */
export function useColorLuminance(color: OpaqueColor): number {
  return useMemo(() => colorLuminance(color), [color]);
}

const CACHE: Record<string, number> = {};

/**
 * Calculates the color's luminance
 *
 * @param color #rgb, #rrggbb[FF], rgb(r,g,b), rgba(r,g,b,1) or [r, g, b]
 */
export function colorLuminance(color: OpaqueColor, cache = true): number {
  if (typeof color === 'string') {
    if (cache && CACHE[color]) {
      return CACHE[color];
    }

    if (color[0] === '#') {
      const rgb = color.slice(1);
      if (rgb.length === 3) {
        return (CACHE[color] = colorLuminance([
          hexToByte(rgb[0] + rgb[0]),
          hexToByte(rgb[1] + rgb[1]),
          hexToByte(rgb[2] + rgb[2]),
        ]));
      }

      if (rgb.length === 8) {
        const alpha = hexToByte(rgb.slice(6, 8));
        if (alpha !== 255) {
          throw new NeedsAlphaBlending(color, alpha);
        }
      }

      if (rgb.length === 6 || rgb.length === 8) {
        return (CACHE[color] = colorLuminance([
          hexToByte(rgb.slice(0, 2)),
          hexToByte(rgb.slice(2, 4)),
          hexToByte(rgb.slice(4, 6)),
        ]));
      }

      throw new UnsupportedFormat(color);
    }

    const matches = color.replace(/ /g, '').match(RGBA_PATTERN);

    if (matches) {
      if (matches[4] && matches[4] !== '1') {
        throw new NeedsAlphaBlending(color, Number(matches[4]));
      }

      return (CACHE[color] = colorLuminance([
        Number(matches[1]),
        Number(matches[2]),
        Number(matches[3]),
      ]));
    }

    throw new UnsupportedFormat(color);
  }

  assertRgbColor(color);

  return componentsToLuminance(color[0] / 255, color[1] / 255, color[2] / 255);
}

function hexToByte(hex: string): number {
  return parseInt(hex, 16);
}

function componentsToLuminance(r: number, g: number, b: number) {
  const rl = r > 0.03928 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  const gl = g > 0.03928 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  const bl = b > 0.03928 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

  // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
  // https://en.wikipedia.org/wiki/Relative_luminance
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function assertRgbColor(color: Exclude<OpaqueColor, string>) {
  if (
    color.length < 3 ||
    color.length > 4 ||
    color.some((d) => d < 0 || d > 255)
  ) {
    throw new UnsupportedFormat(`[${color.join(', ')}]`);
  }

  if (color.length == 4 && color[3] !== 1) {
    throw new NeedsAlphaBlending(`[${color.join(', ')}]`, color[3]);
  }
}

export class UnsupportedFormat extends Error {
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

export class NeedsAlphaBlending extends Error {
  constructor(color: string, alpha: number) {
    super(
      `
Expected a fully opaque color, actual: ${color}, with alpha: ${alpha}.

Colors with that are (semi-)translucent need to be alpha-blended, which means
that you need to know the background color(s) in order to calculate the color
that will show on screen.

The package use-alpha-blended-color has both a React hook as well as a general
utility function to premultiply colors.

  import { useAlphaBlendedColor } from 'use-alpha-blended-color'

  const prepared = useAlphaBlendedColor(${color}, '#<background-color>')
  const luminance = useColorLuminance(prepared)
      `.trim()
    );
  }
}
