import { describe, expect, it } from "vitest";
import { makeInput } from "../helpers";
import { vat } from "../../src/validators/vat";

const v = vat();

function check(value: string, country: string): boolean {
  return v.validate(makeInput(value, { country })).valid;
}

describe("vat", () => {
  it("returns valid:true for empty value", () => {
    expect(v.validate(makeInput("")).valid).toBe(true);
  });

  it("returns valid:true for unknown/missing country", () => {
    expect(check("123456789", "XX")).toBe(true);
    expect(v.validate(makeInput("123456789")).valid).toBe(true);
  });

  // AR
  it("AR - valid", () => expect(check("20267565393", "AR")).toBe(true));
  it("AR - invalid", () => expect(check("20267565394", "AR")).toBe(false));

  // AT
  it("AT - valid with prefix", () => expect(check("ATU13585627", "AT")).toBe(true));
  it("AT - valid without prefix", () => expect(check("U13585627", "AT")).toBe(true));
  it("AT - invalid", () => expect(check("ATU13585626", "AT")).toBe(false));

  // BE
  it("BE - valid 10 digits", () => expect(check("0428759497", "BE")).toBe(true));
  it("BE - valid with prefix", () => expect(check("BE0428759497", "BE")).toBe(true));
  it("BE - invalid", () => expect(check("0428759496", "BE")).toBe(false));

  // BG - legal (9 digits)
  it("BG - legal entity valid", () => expect(check("175074752", "BG")).toBe(true));
  it("BG - legal entity invalid", () => expect(check("175074753", "BG")).toBe(false));
  // BG - physical (10 digits, EGN)
  it("BG - EGN valid", () => expect(check("7523169263", "BG")).toBe(true));

  // BR (CNPJ)
  it("BR - valid", () => expect(check("11222333000181", "BR")).toBe(true));
  it("BR - all-same digits invalid", () => expect(check("11111111111111", "BR")).toBe(false));
  it("BR - invalid checksum", () => expect(check("11222333000182", "BR")).toBe(false));

  // CH
  it("CH - valid with CHE prefix", () => expect(check("CHE107322959MWST", "CH")).toBe(true));
  it("CH - valid with E prefix", () => expect(check("E107322959MWST", "CH")).toBe(true));
  it("CH - invalid", () => expect(check("CHE107322958", "CH")).toBe(false));

  // CY
  it("CY - valid", () => expect(check("10259962F", "CY")).toBe(true));
  it("CY - invalid", () => expect(check("12345678X", "CY")).toBe(false));

  // CZ - 8 digits (legal)
  it("CZ - 8 digits valid", () => expect(check("46505334", "CZ")).toBe(true));
  it("CZ - 8 digits invalid (starts with 9)", () => expect(check("96505334", "CZ")).toBe(false));
  // CZ - 10 digits (physical person / rodné číslo)
  it("CZ - 10 digits valid", () => expect(check("7103192745", "CZ")).toBe(true));

  // DE
  it("DE - valid", () => expect(check("111111125", "DE")).toBe(true));
  it("DE - invalid", () => expect(check("111111124", "DE")).toBe(false));

  // DK
  it("DK - valid", () => expect(check("13585628", "DK")).toBe(true));
  it("DK - invalid", () => expect(check("13585629", "DK")).toBe(false));

  // EE
  it("EE - valid", () => expect(check("100931558", "EE")).toBe(true));
  it("EE - invalid", () => expect(check("100931557", "EE")).toBe(false));

  // EL (Greece with EL prefix)
  it("EL - valid", () => expect(check("023456780", "EL")).toBe(true));
  it("EL - invalid", () => expect(check("123456781", "EL")).toBe(false));

  // ES - DNI
  it("ES - DNI valid", () => expect(check("54362315K", "ES")).toBe(true));
  it("ES - DNI invalid", () => expect(check("54362315Z", "ES")).toBe(false));
  // ES - NIE
  it("ES - NIE valid", () => expect(check("X2482300W", "ES")).toBe(true));
  // ES - CIF
  it("ES - CIF valid", () => expect(check("A58818501", "ES")).toBe(true));

  // FI
  it("FI - valid", () => expect(check("09853608", "FI")).toBe(true));
  it("FI - invalid", () => expect(check("09853604", "FI")).toBe(false));

  // FR
  it("FR - numeric key valid", () => expect(check("13542107651", "FR")).toBe(true));
  it("FR - invalid", () => expect(check("13542107650", "FR")).toBe(false));

  // GB - standard 9 digits
  it("GB - valid 9 digits", () => expect(check("980780684", "GB")).toBe(true));
  it("GB - invalid 9 digits", () => expect(check("980780685", "GB")).toBe(false));
  // GB - GD code
  it("GB - GD valid", () => expect(check("GD001", "GB")).toBe(true));
  it("GB - HA valid", () => expect(check("HA599", "GB")).toBe(true));

  // GR
  it("GR - valid", () => expect(check("023456780", "GR")).toBe(true));
  it("GR - invalid", () => expect(check("123456781", "GR")).toBe(false));

  // HR
  it("HR - valid", () => expect(check("38192148118", "HR")).toBe(true));
  it("HR - invalid", () => expect(check("38192148117", "HR")).toBe(false));

  // HU
  it("HU - valid", () => expect(check("12892312", "HU")).toBe(true));
  it("HU - invalid", () => expect(check("12892313", "HU")).toBe(false));

  // IE - new style
  it("IE - new style valid", () => expect(check("6433435OA", "IE")).toBe(true));
  it("IE - old style valid", () => expect(check("8Z49289F", "IE")).toBe(true));
  it("IE - invalid", () => expect(check("8Z49288F", "IE")).toBe(false));

  // IS
  it("IS - valid 5 digits", () => expect(check("12345", "IS")).toBe(true));
  it("IS - valid 6 digits", () => expect(check("123456", "IS")).toBe(true));
  it("IS - invalid", () => expect(check("1234", "IS")).toBe(false));

  // IT
  it("IT - valid", () => expect(check("00159560366", "IT")).toBe(true));
  it("IT - invalid all-zero company", () => expect(check("00000000366", "IT")).toBe(false));

  // LT - 9 digits
  it("LT - 9 digits valid", () => expect(check("213179410", "LT")).toBe(true));
  it("LT - 9 digits invalid", () => expect(check("213179411", "LT")).toBe(false));
  // LT - 12 digits
  it("LT - 12 digits valid", () => expect(check("290061371314", "LT")).toBe(true));

  // LU
  it("LU - valid", () => expect(check("15027442", "LU")).toBe(true));
  it("LU - invalid", () => expect(check("15027441", "LU")).toBe(false));

  // LV - legal entity (first digit > 3)
  it("LV - legal entity valid", () => expect(check("40003521600", "LV")).toBe(true));
  it("LV - legal entity invalid", () => expect(check("40003521601", "LV")).toBe(false));

  // MT
  it("MT - valid", () => expect(check("15121333", "MT")).toBe(true));
  it("MT - invalid", () => expect(check("15121332", "MT")).toBe(false));

  // NL
  it("NL - valid BSN-based", () => expect(check("010000446B01", "NL")).toBe(true));
  it("NL - invalid", () => expect(check("123456789B01", "NL")).toBe(false));

  // NO
  it("NO - valid", () => expect(check("985986835", "NO")).toBe(true));
  it("NO - invalid", () => expect(check("985986839", "NO")).toBe(false));

  // PL
  it("PL - valid", () => expect(check("8567346215", "PL")).toBe(true));
  it("PL - invalid", () => expect(check("8567346216", "PL")).toBe(false));

  // PT
  it("PT - valid", () => expect(check("545259045", "PT")).toBe(true));
  it("PT - invalid", () => expect(check("545259046", "PT")).toBe(false));

  // RO
  it("RO - valid", () => expect(check("18547290", "RO")).toBe(true));
  it("RO - invalid", () => expect(check("18547291", "RO")).toBe(false));

  // RS
  it("RS - valid", () => expect(check("101134702", "RS")).toBe(true));
  it("RS - invalid", () => expect(check("101134701", "RS")).toBe(false));

  // RU - 10 digits
  it("RU - 10 digits valid", () => expect(check("7805392272", "RU")).toBe(true));
  it("RU - 10 digits invalid", () => expect(check("7805392270", "RU")).toBe(false));
  // RU - 12 digits
  it("RU - 12 digits valid", () => expect(check("760307073214", "RU")).toBe(true));

  // SE
  it("SE - valid", () => expect(check("556564546101", "SE")).toBe(true));
  it("SE - invalid", () => expect(check("556564546402", "SE")).toBe(false));

  // SI
  it("SI - valid", () => expect(check("15012557", "SI")).toBe(true));
  it("SI - invalid", () => expect(check("15012556", "SI")).toBe(false));

  // SK
  it("SK - valid", () => expect(check("2021853504", "SK")).toBe(true));
  it("SK - invalid", () => expect(check("0021853504", "SK")).toBe(false));

  // VE
  it("VE - valid", () => expect(check("J309272292", "VE")).toBe(true));
  it("VE - invalid", () => expect(check("J309272291", "VE")).toBe(false));

  // ZA
  it("ZA - valid", () => expect(check("4012345678", "ZA")).toBe(true));
  it("ZA - invalid not starting with 4", () => expect(check("5012345678", "ZA")).toBe(false));
  it("ZA - invalid length", () => expect(check("401234567", "ZA")).toBe(false));
});
