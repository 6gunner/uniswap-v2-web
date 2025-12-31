// hexToRGBA
export function rgba(r: number | string, g: number = 0, b?: number, a: number = 1): string {
  let red, green, blue, alpha;
  if (typeof r === 'string') {
    const hex = r.toUpperCase().replace('#', '');
    if (hex.length === 3) {
      red = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      green = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      blue = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      alpha = g || 1;
    } else if (hex.length === 6) {
      red = parseInt(hex.substring(0, 2), 16);
      green = parseInt(hex.substring(2, 4), 16);
      blue = parseInt(hex.substring(4, 6), 16);
      alpha = g || 1;
    } else {
      throw new Error('Invalid color format. Please use the format "#RRGGBB" or "#RGB".');
    }
  } else {
    red = r;
    green = g;
    blue = b as number;
    alpha = a;
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function hexToRgb(hex: string): number[] {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(rgb: number[]): string {
  return (
    '#' +
    rgb
      .map(value => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function blendColorsWithAlpha(overlayColor: number[], backgroundColor: number[], alpha: number): number[] {
  const blendedColor = overlayColor.map((overlayChannel, index) => {
    const backgroundChannel = backgroundColor[index];
    return Math.round(overlayChannel * alpha + backgroundChannel * (1 - alpha));
  });

  return blendedColor;
}

export function blendHexColors(baseHex: string, overlayHex: string, alpha: number): string {
  const baseRgb = hexToRgb(baseHex);
  const overlayRgb = hexToRgb(overlayHex);

  const blendedColor = blendColorsWithAlpha(overlayRgb, baseRgb, alpha);
  return rgbToHex(blendedColor);
}
