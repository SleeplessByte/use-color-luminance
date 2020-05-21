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
declare type PremultipliedColor = string | [number, number, number] | [number, number, number, 1];
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
export declare function useIsColorDark(color: PremultipliedColor, perceived?: true, threshold?: number): boolean;
export declare function useColorLuminance(color: PremultipliedColor, perceived?: true): number;
/**
 * Calculates the color's luminance
 *
 * @param color #rgb, #rrggbb[FF], rgb(r,g,b), rgba(r,g,b,1) or [r, g, b]
 * @param perceived if false, uses sRGB luminance instead of perceived
 */
export declare function colorLuminance(color: PremultipliedColor, perceived?: true): number;
export {};
//# sourceMappingURL=useColorLuminance.d.ts.map