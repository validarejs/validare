import type { ValidatorFactory } from "../core/types";

const VALID_PREFIXES = new Set([
  // Andover
  "10",
  "12",
  // Atlanta
  "60",
  "67",
  // Austin
  "50",
  "53",
  // Brookhaven
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "11",
  "13",
  "14",
  "16",
  "21",
  "22",
  "23",
  "25",
  "34",
  "51",
  "52",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "65",
  // Cincinnati
  "30",
  "32",
  "35",
  "36",
  "37",
  "38",
  "61",
  // Fresno
  "15",
  "24",
  // Internet
  "20",
  "26",
  "27",
  "45",
  "46",
  "47",
  // Kansas City
  "40",
  "44",
  // Memphis
  "94",
  "95",
  // Ogden
  "80",
  "90",
  // Philadelphia
  "33",
  "39",
  "41",
  "42",
  "43",
  "48",
  "62",
  "63",
  "64",
  "66",
  "68",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "91",
  "92",
  "93",
  "98",
  "99",
  // Small Business Administration
  "31",
]);

export const ein: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    if (!/^[0-9]{2}-?[0-9]{7}$/.test(input.value)) return { valid: false };
    return { valid: VALID_PREFIXES.has(input.value.substring(0, 2)) };
  },
});
