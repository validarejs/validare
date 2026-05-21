import type { ValidatorFactory } from "../core/types";

const COUNTRY_CODES = new Set([
  "AT",
  "BG",
  "BR",
  "CA",
  "CH",
  "CZ",
  "DE",
  "DK",
  "ES",
  "FR",
  "GB",
  "IE",
  "IN",
  "IT",
  "MA",
  "NL",
  "PL",
  "PT",
  "RO",
  "RU",
  "SE",
  "SG",
  "SK",
  "US",
]);

function gbValid(value: string): boolean {
  const regexps = [
    // AN NAA, ANN NAA, AAN NAA, AANN NAA
    /^([ABCDEFGHIJKLMNOPRSTUWYZ][ABCDEFGHKLMNOPQRSTUVWXY]?[0-9]{1,2})(\s*)([0-9][ABDEFGHJLNPQRSTUWXYZ]{2})$/i,
    // ANA NAA
    /^([ABCDEFGHIJKLMNOPRSTUWYZ][0-9][ABCDEFGHJKPMNRSTUVWXY])(\s*)([0-9][ABDEFGHJLNPQRSTUWXYZ]{2})$/i,
    // AANA NAA
    /^([ABCDEFGHIJKLMNOPRSTUWYZ][ABCDEFGHKLMNOPQRSTUVWXY][0-9][ABEHMNPRVWXY])(\s*)([0-9][ABDEFGHJLNPQRSTUWXYZ]{2})$/i,
    // BFPO postcodes
    /^(BF1)(\s*)([0-6][ABDEFGHJLNPQRST][ABDEFGHJLNPQRSTUWZYZ])$/i,
    /^(GIR)(\s*)(0AA)$/i,
    /^(BFPO)(\s*)([0-9]{1,4})$/i,
    /^(BFPO)(\s*)(c\/o\s*[0-9]{1,3})$/i,
    /^([A-Z]{4})(\s*)(1ZZ)$/i,
    /^(AI-2640)$/i,
  ];
  return regexps.some((r) => r.test(value));
}

export const zipCode: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };

    const country = ((input.options.country as string | undefined) || "").toUpperCase();
    if (!country || !COUNTRY_CODES.has(country)) return { valid: true };

    let isValid = false;

    switch (country) {
      case "AT":
        isValid = /^([1-9]{1})(\d{3})$/.test(input.value);
        break;
      case "BG":
        isValid = /^([1-9]{1}[0-9]{3})$/.test(input.value);
        break;
      case "BR":
        isValid = /^(\d{2})([.]?)(\d{3})([-]?)(\d{3})$/.test(input.value);
        break;
      case "CA":
        isValid =
          /^(?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|X|Y)[0-9](?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|W|X|Y|Z)\s?[0-9](?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|W|X|Y|Z)[0-9]$/i.test(
            input.value,
          );
        break;
      case "CH":
        isValid = /^([1-9]{1})(\d{3})$/.test(input.value);
        break;
      case "CZ":
        isValid = /^(\d{3})([ ]?)(\d{2})$/.test(input.value);
        break;
      case "DE":
        isValid = /^(?!01000|99999)(0[1-9]\d{3}|[1-9]\d{4})$/.test(input.value);
        break;
      case "DK":
        isValid = /^(DK(-|\s)?)?\d{4}$/i.test(input.value);
        break;
      case "ES":
        isValid = /^(?:0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/.test(input.value);
        break;
      case "FR":
        isValid = /^[0-9]{5}$/.test(input.value);
        break;
      case "GB":
        isValid = gbValid(input.value);
        break;
      case "IE":
        isValid = /^(D6W|[ACDEFHKNPRTVWXY]\d{2})\s[0-9ACDEFHKNPRTVWXY]{4}$/.test(input.value);
        break;
      case "IN":
        isValid = /^\d{3}\s?\d{3}$/.test(input.value);
        break;
      case "IT":
        isValid = /^(I-|IT-)?\d{5}$/i.test(input.value);
        break;
      case "MA":
        isValid = /^[1-9][0-9]{4}$/.test(input.value);
        break;
      case "NL":
        isValid = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(input.value);
        break;
      case "PL":
        isValid = /^[0-9]{2}-[0-9]{3}$/.test(input.value);
        break;
      case "PT":
        isValid = /^[1-9]\d{3}-\d{3}$/.test(input.value);
        break;
      case "RO":
        isValid = /^(0[1-8]{1}|[1-9]{1}[0-5]{1})?[0-9]{4}$/.test(input.value);
        break;
      case "RU":
        isValid = /^[0-9]{6}$/.test(input.value);
        break;
      case "SE":
        isValid = /^(S-)?\d{3}\s?\d{2}$/i.test(input.value);
        break;
      case "SG":
        isValid = /^([0][1-9]|[1-6][0-9]|[7]([0-3]|[5-9])|[8][0-2])(\d{4})$/.test(input.value);
        break;
      case "SK":
        isValid = /^(\d{3})([ ]?)(\d{2})$/.test(input.value);
        break;
      default:
        isValid = /^\d{4,5}([-]?\d{4})?$/.test(input.value);
        break;
    }

    return { valid: isValid };
  },
});
