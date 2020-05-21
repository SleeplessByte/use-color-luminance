var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { useMemo } from 'react';
var RGBA_PATTERN = /rgba?\(([0-9]+),([0-9]+),([0-9]+)(?:,(1|0|0\.[0-9]*))?\)/;
var DEFAULT_THRESHOLD = 0.5;
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
export function useIsColorDark(color, perceived, threshold) {
    if (threshold === void 0) { threshold = DEFAULT_THRESHOLD; }
    return useColorLuminance(color, perceived) < threshold;
}
export function useColorLuminance(color, perceived) {
    return useMemo(function () { return colorLuminance(color, perceived); }, [color, perceived]);
}
/**
 * Calculates the color's luminance
 *
 * @param color #rgb, #rrggbb[FF], rgb(r,g,b), rgba(r,g,b,1) or [r, g, b]
 * @param perceived if false, uses sRGB luminance instead of perceived
 */
export function colorLuminance(color, perceived) {
    if (typeof color === 'string') {
        if (color[0] === '#') {
            var rgb = color.slice(1);
            if (rgb.length === 3) {
                return colorLuminance([
                    hexToByte(rgb[0] + rgb[0]),
                    hexToByte(rgb[1] + rgb[1]),
                    hexToByte(rgb[2] + rgb[2]),
                ], perceived);
            }
            if (rgb.length === 8) {
                var alpha = hexToByte(rgb.slice(6, 8));
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
        var matches = color.replace(/ /g, '').match(RGBA_PATTERN);
        if (matches) {
            if (matches[4] && matches[4] !== '1') {
                throw new NotPremultiplied(color, Number(matches[4]));
            }
            return colorLuminance([Number(matches[1]), Number(matches[2]), Number(matches[3])], perceived);
        }
        throw new UnsupportedFormat(color);
    }
    assertRgbColor(color);
    return componentsToLuminance(color[0] / 255, color[1] / 255, color[2] / 255, !!perceived);
}
function hexToByte(hex) {
    return parseInt(hex, 16) / 255;
}
function componentsToLuminance(r, g, b, perceived) {
    if (perceived) {
        // https://www.w3.org/TR/AERT/#color-contrast
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    // https://en.wikipedia.org/wiki/Relative_luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function assertRgbColor(color) {
    if (color.length < 3 ||
        color.length > 4 ||
        color.some(function (d) { return d < 0 || d > 255; })) {
        throw new UnsupportedFormat("[" + color.join(', ') + "]");
    }
    if (color.length == 4 && color[3] !== 1) {
        throw new NotPremultiplied("[" + color.join(', ') + "]", color[3]);
    }
}
var UnsupportedFormat = /** @class */ (function (_super) {
    __extends(UnsupportedFormat, _super);
    function UnsupportedFormat(color) {
        return _super.call(this, ("\nExpected color to be in a supported format, actual: " + color + ".\n\nSupported formats for string input are:\n\n- #rgb\n- #rrggbb\n- #rrggbbFF\n- rgb(r, g, b)      (0 <= rgb <= 255)\n- rgba(r, g, b, 1)  (0 <= rgb <= 255)\n\nSupported formats for array input are:\n\n - [r, g, b]         (0 <= rgb <= 255)\n - [r, g, b, 1]      (0 <= rgb <= 255)\n\nKeyword/system colors are not supported (nor consistent across environments).\n      ").trim()) || this;
    }
    return UnsupportedFormat;
}(Error));
var NotPremultiplied = /** @class */ (function (_super) {
    __extends(NotPremultiplied, _super);
    function NotPremultiplied(color, alpha) {
        return _super.call(this, ("\nExpected a fully opaque color, actual: " + color + ", with alpha: " + alpha + ".\n\nColors with that are (semi-)translucent need to be pre-multiplied, which means\nthat you need to know the background color(s) in order to calculate the color\nthat will show on screen.\n\nThe package use-premultiplied-color has both a React hook as well as a general\nutility function to premultiply colors.\n\n  import { usePremultipliedColor } from 'use-premultiplied-color'\n\n  const premultiplied = usePremultipliedColor(" + color + ", '#<background-color>')\n  const luminance = useColorLuminance(" + color + ")\n      ").trim()) || this;
    }
    return NotPremultiplied;
}(Error));
