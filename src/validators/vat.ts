import type { ValidatorFactory } from "../core/types";

// --- Shared algorithm helpers ---

const LUHN_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
];

function luhn(value: string): boolean {
  let mul = 0;
  let sum = 0;
  let length = value.length;
  while (length--) {
    sum += LUHN_TABLE[mul][Number.parseInt(value.charAt(length), 10)];
    mul = 1 - mul;
  }
  return sum % 10 === 0 && sum > 0;
}

// ISO 7064 MOD 11,10
function mod11And10(value: string): boolean {
  const length = value.length;
  let check = 5;
  for (let i = 0; i < length; i++) {
    check = ((((check || 10) * 2) % 11) + Number.parseInt(value.charAt(i), 10)) % 10;
  }
  return check === 1;
}

// ISO 7064 MOD 97,10 — letters A-Z become 10-35
function mod97And10(input: string): boolean {
  const digits = input
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90 ? code - 55 : c;
    })
    .join("")
    .split("")
    .map((c) => Number.parseInt(c, 10));
  let temp = 0;
  const len = digits.length;
  for (let i = 0; i < len - 1; i++) {
    temp = ((temp + digits[i]) * 10) % 97;
  }
  temp += digits[len - 1];
  return temp % 97 === 1;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;
  if (year < 1000 || year > 9999 || month <= 0 || month > 12) return false;
  const numDays = [
    31,
    year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  return day >= 1 && day <= numDays[month - 1];
}

// --- Country helpers ---

function arVat(value: string): boolean {
  let v = value.replace("-", "");
  if (/^AR[0-9]{11}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{11}$/.test(v)) return false;
  const weight = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum === 11) sum = 0;
  return `${sum}` === v.substr(10);
}

function atVat(value: string): boolean {
  let v = value;
  if (/^ATU[0-9]{8}$/.test(v)) v = v.substr(2);
  if (!/^U[0-9]{8}$/.test(v)) return false;
  v = v.substr(1);
  const weight = [1, 2, 1, 2, 1, 2, 1];
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    let temp = Number.parseInt(v.charAt(i), 10) * weight[i];
    if (temp > 9) temp = Math.floor(temp / 10) + (temp % 10);
    sum += temp;
  }
  sum = 10 - ((sum + 4) % 10);
  if (sum === 10) sum = 0;
  return `${sum}` === v.substr(7, 1);
}

function beVat(value: string): boolean {
  let v = value;
  if (/^BE[0]?[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0]?[0-9]{9}$/.test(v)) return false;
  if (v.length === 9) v = `0${v}`;
  if (v.substr(1, 1) === "0") return false;
  return (Number.parseInt(v.substr(0, 8), 10) + Number.parseInt(v.substr(8, 2), 10)) % 97 === 0;
}

function bgVat(value: string): boolean {
  let v = value;
  if (/^BG[0-9]{9,10}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9,10}$/.test(v)) return false;

  if (v.length === 9) {
    // Legal entity
    let sum = 0;
    for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * (i + 1);
    sum = sum % 11;
    if (sum === 10) {
      sum = 0;
      for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * (i + 3);
      sum = sum % 11;
    }
    sum = sum % 10;
    return `${sum}` === v.substr(8);
  }

  // Physical: EGN
  const isEgn = (inp: string): boolean => {
    let year = Number.parseInt(inp.substr(0, 2), 10) + 1900;
    let month = Number.parseInt(inp.substr(2, 2), 10);
    const day = Number.parseInt(inp.substr(4, 2), 10);
    if (month > 40) { year += 100; month -= 40; }
    else if (month > 20) { year -= 100; month -= 20; }
    if (!isValidDate(year, month, day)) return false;
    const weight = [2, 4, 8, 5, 10, 9, 7, 3, 6];
    let s = 0;
    for (let j = 0; j < 9; j++) s += Number.parseInt(inp.charAt(j), 10) * weight[j];
    s = (s % 11) % 10;
    return `${s}` === inp.substr(9, 1);
  };

  // Physical: PNF (foreigner)
  const isPnf = (inp: string): boolean => {
    const weight = [21, 19, 17, 13, 11, 9, 7, 3, 1];
    let s = 0;
    for (let j = 0; j < 9; j++) s += Number.parseInt(inp.charAt(j), 10) * weight[j];
    s = s % 10;
    return `${s}` === inp.substr(9, 1);
  };

  // Physical: VAT fallback
  const isBgVat = (inp: string): boolean => {
    const weight = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let s = 0;
    for (let j = 0; j < 9; j++) s += Number.parseInt(inp.charAt(j), 10) * weight[j];
    s = 11 - (s % 11);
    if (s === 10) return false;
    if (s === 11) s = 0;
    return `${s}` === inp.substr(9, 1);
  };

  return isEgn(v) || isPnf(v) || isBgVat(v);
}

function brVat(value: string): boolean {
  if (value === "") return true;
  const cnpj = value.replace(/[^\d]+/g, "");
  if (cnpj === "" || cnpj.length !== 14) return false;
  // All-same digits invalid
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number.parseInt(digits.charAt(0), 10)) return false;
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number.parseInt(digits.charAt(1), 10);
}

function chVat(value: string): boolean {
  let v = value;
  if (/^CHE[0-9]{9}(MWST|TVA|IVA|TPV)?$/.test(v)) v = v.substr(2);
  if (!/^E[0-9]{9}(MWST|TVA|IVA|TPV)?$/.test(v)) return false;
  v = v.substr(1);
  const weight = [5, 4, 3, 2, 7, 6, 5, 4];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum === 10) return false;
  if (sum === 11) sum = 0;
  return `${sum}` === v.substr(8, 1);
}

function cyVat(value: string): boolean {
  let v = value;
  if (/^CY[0-5|9][0-9]{7}[A-Z]$/.test(v)) v = v.substr(2);
  if (!/^[0-5|9][0-9]{7}[A-Z]$/.test(v)) return false;
  if (v.substr(0, 2) === "12") return false;
  const translation: Record<string, number> = { "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21 };
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let temp = Number.parseInt(v.charAt(i), 10);
    if (i % 2 === 0) temp = translation[`${temp}`];
    sum += temp;
  }
  return `${"ABCDEFGHIJKLMNOPQRSTUVWXYZ"[sum % 26]}` === v.substr(8, 1);
}

function czVat(value: string): boolean {
  let v = value;
  if (/^CZ[0-9]{8,10}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{8,10}$/.test(v)) return false;

  if (v.length === 8) {
    if (v.charAt(0) === "9") return false;
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += Number.parseInt(v.charAt(i), 10) * (8 - i);
    sum = 11 - (sum % 11);
    if (sum === 10) sum = 0;
    if (sum === 11) sum = 1;
    return `${sum}` === v.substr(7, 1);
  }

  if (v.length === 9 && v.charAt(0) === "6") {
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += Number.parseInt(v.charAt(i + 1), 10) * (8 - i);
    sum = 11 - (sum % 11);
    if (sum === 10) sum = 0;
    if (sum === 11) sum = 1;
    sum = [8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 10][sum - 1];
    return `${sum}` === v.substr(8, 1);
  }

  if (v.length === 9 || v.length === 10) {
    let year = 1900 + Number.parseInt(v.substr(0, 2), 10);
    const month = (Number.parseInt(v.substr(2, 2), 10) % 50) % 20;
    const day = Number.parseInt(v.substr(4, 2), 10);
    if (v.length === 9) {
      if (year >= 1980) year -= 100;
      if (year > 1953) return false;
    } else if (year < 1954) {
      year += 100;
    }
    if (!isValidDate(year, month, day)) return false;
    if (v.length === 10) {
      let check = Number.parseInt(v.substr(0, 9), 10) % 11;
      if (year < 1985) check = check % 10;
      return `${check}` === v.substr(9, 1);
    }
    return true;
  }

  return false;
}

function deVat(value: string): boolean {
  let v = value;
  if (/^DE[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[1-9][0-9]{8}$/.test(v)) return false;
  return mod11And10(v);
}

function dkVat(value: string): boolean {
  let v = value;
  if (/^DK[0-9]{8}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{8}$/.test(v)) return false;
  const weight = [2, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 11 === 0;
}

function eeVat(value: string): boolean {
  let v = value;
  if (/^EE[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}$/.test(v)) return false;
  const weight = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 10 === 0;
}

function esVat(value: string): boolean {
  let v = value;
  if (/^ES[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(v)) v = v.substr(2);
  if (!/^[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(v)) return false;

  const dni = (inp: string): boolean => {
    const check = Number.parseInt(inp.substr(0, 8), 10);
    return `${"TRWAGMYFPDXBNJZSQVHLCKE"[check % 23]}` === inp.substr(8, 1);
  };

  const nie = (inp: string): boolean => {
    const check = ["XYZ".indexOf(inp.charAt(0)), inp.substr(1)].join("");
    const cd = "TRWAGMYFPDXBNJZSQVHLCKE"[Number.parseInt(check, 10) % 23];
    return `${cd}` === inp.substr(8, 1);
  };

  const cif = (inp: string): boolean => {
    const firstChar = inp.charAt(0);
    if ("KLM".indexOf(firstChar) !== -1) {
      const check = Number.parseInt(inp.substr(1, 8), 10);
      return `${"TRWAGMYFPDXBNJZSQVHLCKE"[check % 23]}` === inp.substr(8, 1);
    }
    if ("ABCDEFGHJNPQRSUVW".indexOf(firstChar) !== -1) {
      const weight = [2, 1, 2, 1, 2, 1, 2];
      let sum = 0;
      for (let i = 0; i < 7; i++) {
        let temp = Number.parseInt(inp.charAt(i + 1), 10) * weight[i];
        if (temp > 9) temp = Math.floor(temp / 10) + (temp % 10);
        sum += temp;
      }
      sum = 10 - (sum % 10);
      if (sum === 10) sum = 0;
      return `${sum}` === inp.substr(8, 1) || "JABCDEFGHI"[sum] === inp.substr(8, 1);
    }
    return false;
  };

  const first = v.charAt(0);
  if (/^[0-9]$/.test(first)) return dni(v);
  if (/^[XYZ]$/.test(first)) return nie(v);
  return cif(v);
}

function fiVat(value: string): boolean {
  let v = value;
  if (/^FI[0-9]{8}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{8}$/.test(v)) return false;
  const weight = [7, 9, 10, 5, 8, 4, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 11 === 0;
}

function frVat(value: string): boolean {
  let v = value;
  if (/^FR[0-9A-Z]{2}[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9A-Z]{2}[0-9]{9}$/.test(v)) return false;
  if (v.substr(2, 4) !== "000") {
    return luhn(v.substr(2));
  }
  if (/^[0-9]{2}$/.test(v.substr(0, 2))) {
    return v.substr(0, 2) === `${Number.parseInt(v.substr(2) + "12", 10) % 97}`;
  }
  const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let check: number;
  if (/^[0-9]$/.test(v.charAt(0))) {
    check = alphabet.indexOf(v.charAt(0)) * 24 + alphabet.indexOf(v.charAt(1)) - 10;
  } else {
    check = alphabet.indexOf(v.charAt(0)) * 34 + alphabet.indexOf(v.charAt(1)) - 100;
  }
  return (Number.parseInt(v.substr(2), 10) + 1 + Math.floor(check / 11)) % 11 === check % 11;
}

function gbVat(value: string): boolean {
  let v = value;
  if (
    /^GB[0-9]{9}$/.test(v) ||
    /^GB[0-9]{12}$/.test(v) ||
    /^GBGD[0-9]{3}$/.test(v) ||
    /^GBHA[0-9]{3}$/.test(v) ||
    /^GB(GD|HA)8888[0-9]{5}$/.test(v)
  ) {
    v = v.substr(2);
  }
  if (
    !/^[0-9]{9}$/.test(v) &&
    !/^[0-9]{12}$/.test(v) &&
    !/^GD[0-9]{3}$/.test(v) &&
    !/^HA[0-9]{3}$/.test(v) &&
    !/^(GD|HA)8888[0-9]{5}$/.test(v)
  ) {
    return false;
  }
  const length = v.length;
  if (length === 5) {
    const firstTwo = v.substr(0, 2);
    const lastThree = Number.parseInt(v.substr(2), 10);
    return ("GD" === firstTwo && lastThree < 500) || ("HA" === firstTwo && lastThree >= 500);
  }
  if (length === 11 && ("GD8888" === v.substr(0, 6) || "HA8888" === v.substr(0, 6))) {
    if (
      ("GD" === v.substr(0, 2) && Number.parseInt(v.substr(6, 3), 10) >= 500) ||
      ("HA" === v.substr(0, 2) && Number.parseInt(v.substr(6, 3), 10) < 500)
    ) {
      return false;
    }
    return Number.parseInt(v.substr(6, 3), 10) % 97 === Number.parseInt(v.substr(9, 2), 10);
  }
  if (length === 9 || length === 12) {
    const weight = [8, 7, 6, 5, 4, 3, 2, 10, 1];
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
    sum = sum % 97;
    return Number.parseInt(v.substr(0, 3), 10) >= 100 ? sum === 0 || sum === 42 || sum === 55 : sum === 0;
  }
  return true;
}

function grVat(value: string): boolean {
  let v = value;
  if (/^(GR|EL)[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}$/.test(v)) return false;
  if (v.length === 8) v = `0${v}`;
  const weight = [256, 128, 64, 32, 16, 8, 4, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = (sum % 11) % 10;
  return `${sum}` === v.substr(8, 1);
}

function hrVat(value: string): boolean {
  let v = value;
  if (/^HR[0-9]{11}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{11}$/.test(v)) return false;
  return mod11And10(v);
}

function huVat(value: string): boolean {
  let v = value;
  if (/^HU[0-9]{8}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{8}$/.test(v)) return false;
  const weight = [9, 7, 3, 1, 9, 7, 3, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 10 === 0;
}

function ieVat(value: string): boolean {
  let v = value;
  if (/^IE[0-9][0-9A-Z*+][0-9]{5}[A-Z]{1,2}$/.test(v)) v = v.substr(2);
  if (!/^[0-9][0-9A-Z*+][0-9]{5}[A-Z]{1,2}$/.test(v)) return false;

  const getCheckDigit = (inp: string): string => {
    let input = inp;
    while (input.length < 7) input = `0${input}`;
    const alphabet = "WABCDEFGHIJKLMNOPQRSTUV";
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += Number.parseInt(input.charAt(i), 10) * (8 - i);
    sum += 9 * alphabet.indexOf(input.substr(7));
    return alphabet[sum % 23];
  };

  if (/^[0-9]+$/.test(v.substr(0, 7))) {
    return v.charAt(7) === getCheckDigit(`${v.substr(0, 7)}${v.substr(8)}`);
  }
  if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ+*".indexOf(v.charAt(1)) !== -1) {
    return v.charAt(7) === getCheckDigit(`${v.substr(2, 5)}${v.substr(0, 1)}`);
  }
  return true;
}

function isVat(value: string): boolean {
  let v = value;
  if (/^IS[0-9]{5,6}$/.test(v)) v = v.substr(2);
  return /^[0-9]{5,6}$/.test(v);
}

function itVat(value: string): boolean {
  let v = value;
  if (/^IT[0-9]{11}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{11}$/.test(v)) return false;
  if (Number.parseInt(v.substr(0, 7), 10) === 0) return false;
  const lastThree = Number.parseInt(v.substr(7, 3), 10);
  if (lastThree < 1 || (lastThree > 201 && lastThree !== 999 && lastThree !== 888)) return false;
  return luhn(v);
}

function ltVat(value: string): boolean {
  let v = value;
  if (/^LT([0-9]{7}1[0-9]|[0-9]{10}1[0-9])$/.test(v)) v = v.substr(2);
  if (!/^([0-9]{7}1[0-9]|[0-9]{10}1[0-9])$/.test(v)) return false;
  const length = v.length;
  let sum = 0;
  for (let i = 0; i < length - 1; i++) sum += Number.parseInt(v.charAt(i), 10) * (1 + (i % 9));
  let check = sum % 11;
  if (check === 10) {
    sum = 0;
    for (let i = 0; i < length - 1; i++) sum += Number.parseInt(v.charAt(i), 10) * (1 + ((i + 2) % 9));
  }
  check = (check % 11) % 10;
  return `${check}` === v.charAt(length - 1);
}

function luVat(value: string): boolean {
  let v = value;
  if (/^LU[0-9]{8}$/.test(v)) v = v.substring(2);
  if (!/^[0-9]{8}$/.test(v)) return false;
  return Number.parseInt(v.substring(0, 6), 10) % 89 === Number.parseInt(v.substring(6, 8), 10);
}

function lvVat(value: string): boolean {
  let v = value;
  if (/^LV[0-9]{11}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{11}$/.test(v)) return false;
  const first = Number.parseInt(v.charAt(0), 10);
  const length = v.length;
  if (first > 3) {
    // Legal entity
    const weight = [9, 1, 4, 8, 3, 10, 2, 5, 7, 6, 1];
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
    return sum % 11 === 3;
  }
  // Personal code (birth date based)
  const day = Number.parseInt(v.substr(0, 2), 10);
  const month = Number.parseInt(v.substr(2, 2), 10);
  let year = Number.parseInt(v.substr(4, 2), 10);
  year = year + 1800 + Number.parseInt(v.charAt(6), 10) * 100;
  if (!isValidDate(year, month, day)) return false;
  const weight = [10, 5, 8, 4, 2, 1, 6, 3, 7, 9];
  let sum = 0;
  for (let i = 0; i < length - 1; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = ((sum + 1) % 11) % 10;
  return `${sum}` === v.charAt(length - 1);
}

function mtVat(value: string): boolean {
  let v = value;
  if (/^MT[0-9]{8}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{8}$/.test(v)) return false;
  const weight = [3, 4, 6, 7, 8, 9, 10, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 37 === 0;
}

function nlId(value: string): boolean {
  if (value.length < 8) return false;
  let v = value;
  if (v.length === 8) v = `0${v}`;
  if (!/^[0-9]{4}[.]{0,1}[0-9]{2}[.]{0,1}[0-9]{3}$/.test(v)) return false;
  v = v.replace(/\./g, "");
  if (Number.parseInt(v, 10) === 0) return false;
  let sum = 0;
  const length = v.length;
  for (let i = 0; i < length - 1; i++) sum += (9 - i) * Number.parseInt(v.charAt(i), 10);
  sum = sum % 11;
  if (sum === 10) sum = 0;
  return `${sum}` === v.charAt(length - 1);
}

function nlVat(value: string): boolean {
  let v = value;
  if (/^NL[0-9]{9}B[0-9]{2}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}B[0-9]{2}$/.test(v)) return false;
  const id = v.substr(0, 9);
  return nlId(id) || mod97And10(`NL${v}`);
}

function noVat(value: string): boolean {
  let v = value;
  if (/^NO[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}$/.test(v)) return false;
  const weight = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum === 11) sum = 0;
  return `${sum}` === v.substr(8, 1);
}

function plVat(value: string): boolean {
  let v = value;
  if (/^PL[0-9]{10}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{10}$/.test(v)) return false;
  const weight = [6, 5, 7, 2, 3, 4, 5, 6, 7, -1];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  return sum % 11 === 0;
}

function ptVat(value: string): boolean {
  let v = value;
  if (/^PT[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}$/.test(v)) return false;
  const weight = [9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum > 9) sum = 0;
  return `${sum}` === v.substr(8, 1);
}

function roVat(value: string): boolean {
  let v = value;
  if (/^RO[1-9][0-9]{1,9}$/.test(v)) v = v.substr(2);
  if (!/^[1-9][0-9]{1,9}$/.test(v)) return false;
  const length = v.length;
  const weight = [7, 5, 3, 2, 1, 7, 5, 3, 2].slice(10 - length);
  let sum = 0;
  for (let i = 0; i < length - 1; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = ((10 * sum) % 11) % 10;
  return `${sum}` === v.substr(length - 1, 1);
}

function rsVat(value: string): boolean {
  let v = value;
  if (/^RS[0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{9}$/.test(v)) return false;
  let sum = 10;
  for (let i = 0; i < 8; i++) {
    let temp = (Number.parseInt(v.charAt(i), 10) + sum) % 10;
    if (temp === 0) temp = 10;
    sum = (2 * temp) % 11;
  }
  return (sum + Number.parseInt(v.substr(8, 1), 10)) % 10 === 1;
}

function ruVat(value: string): boolean {
  let v = value;
  if (/^RU([0-9]{10}|[0-9]{12})$/.test(v)) v = v.substr(2);
  if (!/^([0-9]{10}|[0-9]{12})$/.test(v)) return false;

  if (v.length === 10) {
    const weight = [2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
    sum = sum % 11;
    if (sum > 9) sum = sum % 10;
    return `${sum}` === v.substr(9, 1);
  }

  // 12 digits
  const weight1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
  const weight2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < 11; i++) {
    sum1 += Number.parseInt(v.charAt(i), 10) * weight1[i];
    sum2 += Number.parseInt(v.charAt(i), 10) * weight2[i];
  }
  sum1 = sum1 % 11; if (sum1 > 9) sum1 = sum1 % 10;
  sum2 = sum2 % 11; if (sum2 > 9) sum2 = sum2 % 10;
  return `${sum1}` === v.substr(10, 1) && `${sum2}` === v.substr(11, 1);
}

function seVat(value: string): boolean {
  let v = value;
  if (/^SE[0-9]{10}01$/.test(v)) v = v.substr(2);
  if (!/^[0-9]{10}01$/.test(v)) return false;
  v = v.substr(0, 10);
  return luhn(v);
}

function siVat(value: string): boolean {
  const res = value.match(/^(SI)?([1-9][0-9]{7})$/);
  if (!res) return false;
  const v = res[1] ? value.substr(2) : value;
  const weight = [8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number.parseInt(v.charAt(i), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum === 10) sum = 0;
  return `${sum}` === v.substr(7, 1);
}

function skVat(value: string): boolean {
  let v = value;
  if (/^SK[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(v)) v = v.substr(2);
  if (!/^[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(v)) return false;
  return Number.parseInt(v, 10) % 11 === 0;
}

function veVat(value: string): boolean {
  let v = value;
  if (/^VE[VEJPG][0-9]{9}$/.test(v)) v = v.substr(2);
  if (!/^[VEJPG][0-9]{9}$/.test(v)) return false;
  const types: Record<string, number> = { E: 8, G: 20, J: 12, P: 16, V: 4 };
  const weight = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = types[v.charAt(0)];
  for (let i = 0; i < 8; i++) sum += Number.parseInt(v.charAt(i + 1), 10) * weight[i];
  sum = 11 - (sum % 11);
  if (sum === 11 || sum === 10) sum = 0;
  return `${sum}` === v.substr(9, 1);
}

function zaVat(value: string): boolean {
  let v = value;
  if (/^ZA4[0-9]{9}$/.test(v)) v = v.substr(2);
  return /^4[0-9]{9}$/.test(v);
}

// --- Country code set ---
const COUNTRY_CODES = new Set([
  "AR", "AT", "BE", "BG", "BR", "CH", "CY", "CZ", "DE", "DK",
  "EE", "EL", "ES", "FI", "FR", "GB", "GR", "HR", "HU", "IE",
  "IS", "IT", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT",
  "RO", "RS", "RU", "SE", "SI", "SK", "VE", "ZA",
]);

export const vat: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    const country = ((input.options.country as string | undefined) || "").toUpperCase();
    if (!country || !COUNTRY_CODES.has(country)) return { valid: true };
    switch (country) {
      case "AR": return { valid: arVat(input.value) };
      case "AT": return { valid: atVat(input.value) };
      case "BE": return { valid: beVat(input.value) };
      case "BG": return { valid: bgVat(input.value) };
      case "BR": return { valid: brVat(input.value) };
      case "CH": return { valid: chVat(input.value) };
      case "CY": return { valid: cyVat(input.value) };
      case "CZ": return { valid: czVat(input.value) };
      case "DE": return { valid: deVat(input.value) };
      case "DK": return { valid: dkVat(input.value) };
      case "EE": return { valid: eeVat(input.value) };
      case "EL": return { valid: grVat(input.value) };
      case "ES": return { valid: esVat(input.value) };
      case "FI": return { valid: fiVat(input.value) };
      case "FR": return { valid: frVat(input.value) };
      case "GB": return { valid: gbVat(input.value) };
      case "GR": return { valid: grVat(input.value) };
      case "HR": return { valid: hrVat(input.value) };
      case "HU": return { valid: huVat(input.value) };
      case "IE": return { valid: ieVat(input.value) };
      case "IS": return { valid: isVat(input.value) };
      case "IT": return { valid: itVat(input.value) };
      case "LT": return { valid: ltVat(input.value) };
      case "LU": return { valid: luVat(input.value) };
      case "LV": return { valid: lvVat(input.value) };
      case "MT": return { valid: mtVat(input.value) };
      case "NL": return { valid: nlVat(input.value) };
      case "NO": return { valid: noVat(input.value) };
      case "PL": return { valid: plVat(input.value) };
      case "PT": return { valid: ptVat(input.value) };
      case "RO": return { valid: roVat(input.value) };
      case "RS": return { valid: rsVat(input.value) };
      case "RU": return { valid: ruVat(input.value) };
      case "SE": return { valid: seVat(input.value) };
      case "SI": return { valid: siVat(input.value) };
      case "SK": return { valid: skVat(input.value) };
      case "VE": return { valid: veVat(input.value) };
      case "ZA": return { valid: zaVat(input.value) };
      default: return { valid: true };
    }
  },
});
