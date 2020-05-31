import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  useColorLuminance,
  useContrast,
  useHasContrastOnDark,
  useHasContrastOnLight,
  useIsColorDark,
  contrast,
  colorLuminance,
  OpaqueColor,
  UnsupportedFormat,
  NeedsAlphaBlending,
} from './useColorLuminance';

describe('colorLuminance', () => {
  test('it can get the luminance of #rgb', () => {
    expect(colorLuminance('#fff')).toBe(1);
    expect(colorLuminance('#000')).toBe(0);
    expect(colorLuminance('#f00')).toBe(0.2126);
    expect(colorLuminance('#0f0')).toBe(0.7152);
    expect(colorLuminance('#00f')).toBe(0.0722);
    expect(colorLuminance('#A52')).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of #rrggbb', () => {
    expect(colorLuminance('#ffffff')).toBe(1);
    expect(colorLuminance('#000000')).toBe(0);
    expect(colorLuminance('#ff0000')).toBe(0.2126);
    expect(colorLuminance('#00ff00')).toBe(0.7152);
    expect(colorLuminance('#0000ff')).toBe(0.0722);
    expect(colorLuminance('#AA5522')).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of #rrggbbaa', () => {
    expect(colorLuminance('#ffffffff')).toBe(1);
    expect(colorLuminance('#000000ff')).toBe(0);
    expect(colorLuminance('#ff0000ff')).toBe(0.2126);
    expect(colorLuminance('#00ff00ff')).toBe(0.7152);
    expect(colorLuminance('#0000ffff')).toBe(0.0722);
    expect(colorLuminance('#AA5522FF')).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of rgb(r, g, b)', () => {
    expect(colorLuminance('rgb(255, 255, 255)')).toBe(1);
    expect(colorLuminance('rgb(  0,   0,   0)')).toBe(0);
    expect(colorLuminance('rgb(255,   0,   0)')).toBe(0.2126);
    expect(colorLuminance('rgb(  0, 255,   0)')).toBe(0.7152);
    expect(colorLuminance('rgb(  0,   0, 255)')).toBe(0.0722);
    expect(colorLuminance('rgb(170,  85,  34)')).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of rgba(r, g, b, a)', () => {
    expect(colorLuminance('rgb(255, 255, 255, 1)')).toBe(1);
    expect(colorLuminance('rgb(  0,   0,   0, 1)')).toBe(0);
    expect(colorLuminance('rgb(255,   0,   0, 1)')).toBe(0.2126);
    expect(colorLuminance('rgb(  0, 255,   0, 1)')).toBe(0.7152);
    expect(colorLuminance('rgb(  0,   0, 255, 1)')).toBe(0.0722);
    expect(colorLuminance('rgba(170,  85,  34, 1)')).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of [r, g, b]', () => {
    expect(colorLuminance([255, 255, 255])).toBe(1);
    expect(colorLuminance([0, 0, 0])).toBe(0);
    expect(colorLuminance([255, 0, 0])).toBe(0.2126);
    expect(colorLuminance([0, 255, 0])).toBe(0.7152);
    expect(colorLuminance([0, 0, 255])).toBe(0.0722);
    expect(colorLuminance([170, 85, 34])).toBeCloseTo(0.1516);
  });

  test('it can get the luminance of [r, g, b, a]', () => {
    expect(colorLuminance([255, 255, 255, 1])).toBe(1);
    expect(colorLuminance([0, 0, 0, 1])).toBe(0);
    expect(colorLuminance([255, 0, 0, 1])).toBe(0.2126);
    expect(colorLuminance([0, 255, 0, 1])).toBe(0.7152);
    expect(colorLuminance([0, 0, 255, 1])).toBe(0.0722);
    expect(colorLuminance([170, 85, 34, 1])).toBeCloseTo(0.1516);
  });

  test('it requires opaque colors', () => {
    expect(() => colorLuminance('#ffffff66')).toThrowError(NeedsAlphaBlending);
    expect(() => colorLuminance('rgba(255, 255, 255, .4)')).toThrowError(
      NeedsAlphaBlending
    );
    expect(() =>
      colorLuminance([255, 255, 255, (0.4 as number) as 1])
    ).toThrowError(NeedsAlphaBlending);
  });

  test('it requires a specific format', () => {
    expect(() => colorLuminance('red')).toThrowError(UnsupportedFormat);
    expect(() => colorLuminance('hsla(0, 0, 0, 1)')).toThrowError(
      UnsupportedFormat
    );
  });
});

describe('contrast', () => {
  test('it can get the contrast between two colors', () => {
    expect(contrast('#fff', '#000')).toBe(21);
    expect(contrast('#000', '#fff')).toBe(21);
    expect(contrast('#fff', '#fff')).toBe(1);
    expect(contrast('#000', '#000')).toBe(1);

    expect(contrast('#f00', '#000')).toBe(5.252);
    expect(contrast('#f00', '#fff')).toBeCloseTo(3.998);
    expect(contrast('#0f0', '#000')).toBeCloseTo(15.3);
    expect(contrast('#0f0', '#fff')).toBeCloseTo(1.372);
    expect(contrast('#00f', '#000')).toBe(2.444);
    expect(contrast('#00f', '#fff')).toBeCloseTo(8.592);
    expect(contrast('#A52', '#000')).toBeCloseTo(4.032);
    expect(contrast('#A52', '#fff')).toBeCloseTo(5.208);
  });

  test('it requires opaque colors', () => {
    expect(() => contrast('#ffffff66', '#000')).toThrowError(
      NeedsAlphaBlending
    );
    expect(() => contrast('#000', 'rgba(255, 255, 255, .4)')).toThrowError(
      NeedsAlphaBlending
    );
    expect(() =>
      contrast([255, 255, 255, (0.4 as number) as 1], '#000')
    ).toThrowError(NeedsAlphaBlending);
  });

  test('it requires a specific format', () => {
    expect(() => contrast('red', 'blue')).toThrowError(UnsupportedFormat);
    expect(() => contrast('hsla(0, 0, 0, 1)', 'black')).toThrowError(
      UnsupportedFormat
    );
  });
});

describe('hooks', () => {
  function ContrastCheckOnLight({ color }: { color: OpaqueColor }) {
    const contrast = useHasContrastOnLight(color);
    return <h1>{contrast ? 'yay' : 'nay'}</h1>;
  }

  function ContrastCheckOnDark({ color }: { color: OpaqueColor }) {
    const contrast = useHasContrastOnDark(color);
    return <h1>{contrast ? 'yay' : 'nay'}</h1>;
  }

  function Contrast({
    color,
    background,
  }: {
    color: OpaqueColor;
    background: OpaqueColor;
  }) {
    const contrast = useContrast(color, background);
    return <h1>{contrast}</h1>;
  }

  function DarkCheck({ color }: { color: OpaqueColor }) {
    const dark = useIsColorDark(color);
    return <h1>{dark ? 'yay' : 'nay'}</h1>;
  }

  function Luminance({ color }: { color: OpaqueColor }) {
    const luminance = useColorLuminance(color);
    return <h1>{luminance}</h1>;
  }

  test('it can determine contrast on #fff', () => {
    const screen = render(<ContrastCheckOnLight color="#000" />);
    expect(screen.getByRole('heading')).toHaveTextContent('yay');
  });

  test('it can determine lack of contrast on #fff', () => {
    const screen = render(<ContrastCheckOnLight color="#FFF" />);
    expect(screen.getByRole('heading')).toHaveTextContent('nay');
  });

  test('it can determine contrast on #000', () => {
    const screen = render(<ContrastCheckOnDark color="#FFF" />);
    expect(screen.getByRole('heading')).toHaveTextContent('yay');
  });

  test('it can determine lack of contrast on #000', () => {
    const screen = render(<ContrastCheckOnDark color="#000" />);
    expect(screen.getByRole('heading')).toHaveTextContent('nay');
  });

  test('it can determine contrast on #000', () => {
    const screen = render(<ContrastCheckOnDark color="#FFF" />);
    expect(screen.getByRole('heading')).toHaveTextContent('yay');
  });

  test('it can determine the contrast', () => {
    const screen = render(<Contrast color="#000" background="#fff" />);
    expect(screen.getByRole('heading')).toHaveTextContent('21');
  });

  test('it can approximate if a color is dark', () => {
    const screen = render(<DarkCheck color="#000" />);
    expect(screen.getByRole('heading')).toHaveTextContent('yay');
  });

  test('it can approximate if a color is not dark', () => {
    const screen = render(<DarkCheck color="#fff" />);
    expect(screen.getByRole('heading')).toHaveTextContent('nay');
  });

  test('it can get the luminance', () => {
    const screen = render(<Luminance color="#fff" />);
    expect(screen.getByRole('heading')).toHaveTextContent('1');
  });
});
