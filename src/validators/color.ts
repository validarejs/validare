import type { ValidatorFactory } from '../core/types';

const KEYWORD_COLORS = new Set([
  'aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque','black',
  'blanchedalmond','blue','blueviolet','brown','burlywood','cadetblue','chartreuse',
  'chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan',
  'darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta',
  'darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen',
  'darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink',
  'deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen',
  'fuchsia','gainsboro','ghostwhite','gold','goldenrod','gray','green','greenyellow',
  'grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender',
  'lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan',
  'lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon',
  'lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue',
  'lightyellow','lime','limegreen','linen','magenta','maroon','mediumaquamarine',
  'mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue',
  'mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream',
  'mistyrose','moccasin','navajowhite','navy','oldlace','olive','olivedrab','orange',
  'orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred',
  'papayawhip','peachpuff','peru','pink','plum','powderblue','purple','red','rosybrown',
  'royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna',
  'silver','skyblue','slateblue','slategray','slategrey','snow','springgreen',
  'steelblue','tan','teal','thistle','tomato','transparent','turquoise','violet',
  'wheat','white','whitesmoke','yellow','yellowgreen',
]);

const SUPPORTED_TYPES = ['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'keyword'] as const;

function isHex(v: string) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(v); }
function isRgb(v: string) {
  return /^rgb\((\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*,){2}(\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*)\)$/.test(v) ||
    /^rgb\((\s*(\b(0?\d{1,2}|100)\b%)\s*,){2}(\s*(\b(0?\d{1,2}|100)\b%)\s*)\)$/.test(v);
}
function isRgba(v: string) {
  return /^rgba\((\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*,){3}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(v) ||
    /^rgba\((\s*(\b(0?\d{1,2}|100)\b%)\s*,){3}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(v);
}
function isHsl(v: string) {
  return /^hsl\((\s*(-?\d+)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*)\)$/.test(v);
}
function isHsla(v: string) {
  return /^hsla\((\s*(-?\d+)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*,){2}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(v);
}
function isKeyword(v: string) { return KEYWORD_COLORS.has(v.toLowerCase()); }

const CHECKERS: Record<string, (v: string) => boolean> = {
  hex: isHex, rgb: isRgb, rgba: isRgba, hsl: isHsl, hsla: isHsla, keyword: isKeyword,
};

export const color: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === '') return { valid: true };
    const rawType = input.options.type as string | string[] | undefined;
    const types: string[] = Array.isArray(rawType)
      ? rawType
      : typeof rawType === 'string'
        ? rawType.split(',').map((t) => t.trim())
        : [...SUPPORTED_TYPES];
    for (const t of types) {
      const checker = CHECKERS[t.toLowerCase()];
      if (checker?.(input.value)) return { valid: true };
    }
    return { valid: false };
  },
});
