import { describe, expect, it } from "vitest";
import { makeInput } from "../helpers";
import { id } from "../../src/validators/id";

const v = id();

function check(value: string, country: string): boolean {
  return v.validate(makeInput(value, { country })).valid;
}

describe("id", () => {
  it("returns valid:true for empty value", () => {
    expect(v.validate(makeInput("")).valid).toBe(true);
  });

  it("returns valid:true for unknown country", () => {
    expect(check("123456789", "XX")).toBe(true);
    expect(v.validate(makeInput("123456789")).valid).toBe(true);
  });

  // AR — strip dots, 7-8 digits, no checksum
  it("AR - valid 8 digits", () => expect(check("20000000", "AR")).toBe(true));
  it("AR - valid with dots", () => expect(check("20.000.000", "AR")).toBe(true));
  it("AR - invalid too short", () => expect(check("123456", "AR")).toBe(false));
  it("AR - invalid too long", () => expect(check("123456789", "AR")).toBe(false));

  // BA — JMBG, rr 10-19
  // 1302968175017: rr=17 (in 10-19), checksum k=7 ✓
  it("BA - valid", () => expect(check("1302968175017", "BA")).toBe(true));
  // 1302968175010: rr=17 (in 10-19), but k=0 while computed k=7 → invalid checksum
  it("BA - invalid checksum", () => expect(check("1302968175010", "BA")).toBe(false));

  // BG — EGN: 10 digits, date + weighted checksum
  // 7523169263: month=23 → 23>20 → year=1875, month=3, day=16, check=3 ✓
  it("BG - valid", () => expect(check("7523169263", "BG")).toBe(true));
  // 8032056501: year=1880, month=12, day=05, check=9 but last=1 → invalid checksum
  it("BG - invalid checksum", () => expect(check("8032056501", "BG")).toBe(false));
  it("BG - invalid non-digits", () => expect(check("756A169263", "BG")).toBe(false));

  // BR — CPF
  // 23100299981: d1=8 ✓, d2=1 ✓
  it("BR - valid with formatting", () => expect(check("231.002.999-81", "BR")).toBe(true));
  it("BR - valid raw digits", () => expect(check("23100299981", "BR")).toBe(true));
  // 23100299982: d1=8 ✓ but d2 fails → invalid
  it("BR - invalid checksum", () => expect(check("231.002.999-82", "BR")).toBe(false));
  it("BR - invalid all same digit", () => expect(check("11111111111", "BR")).toBe(false));

  // CH — AHV number: 756.NNNN.NNNN.NN
  // 756.9217.0769.81: v=9217076981, sum=99, check=10-(99%10)=1, last=1 ✓
  it("CH - valid", () => expect(check("756.9217.0769.81", "CH")).toBe(true));
  // 756.9217.0769.82: last=2 but check=1 → invalid checksum
  it("CH - invalid checksum", () => expect(check("756.9217.0769.82", "CH")).toBe(false));

  // CL — RUN/RUT
  // 76086428-5: sum=149, cd=5 ✓
  it("CL - valid numeric check", () => expect(check("76086428-5", "CL")).toBe(true));
  // 1000005-K: v=01000005K, sum=90, 11-(90%11)=10 → K ✓
  it("CL - valid K check", () => expect(check("1000005-K", "CL")).toBe(true));
  // 76086428-6: cd should be 5 but last=6 → invalid
  it("CL - invalid checksum", () => expect(check("76086428-6", "CL")).toBe(false));

  // CN — 18-digit RIC
  // 11010519980213411X: province=11, prefectural=01, county=05, DOB=19980213, check=10=X ✓
  it("CN - valid 18 digits", () =>
    expect(check("11010519980213411X", "CN")).toBe(true));
  // 110105980213411: 15-digit, province=11, DOB=19980213, no checksum ✓
  it("CN - valid 15 digits", () => expect(check("110105980213411", "CN")).toBe(true));
  it("CN - invalid wrong length", () => expect(check("12345678", "CN")).toBe(false));
  // 990105199802134118: province=99 not in adminDivisionCodes → invalid
  it("CN - invalid admin code", () =>
    expect(check("990105199802134118", "CN")).toBe(false));

  // CO — NIT
  // 79927398717: sum=1324, 1324%11=4, 11-4=7, last=7 ✓
  it("CO - valid", () => expect(check("79927398717", "CO")).toBe(true));
  // 79927398710: check=7 but last=0 → invalid
  it("CO - invalid checksum", () => expect(check("79927398710", "CO")).toBe(false));

  // CZ — RC
  // 7103192745: year=1971, month=3, day=19, check=5 ✓
  it("CZ - valid 10 digits", () => expect(check("7103192745", "CZ")).toBe(true));
  // 530101001: 9-digit, year=1953 (not > 1953), valid date → true
  it("CZ - valid 9 digits", () => expect(check("530101001", "CZ")).toBe(true));
  // 1103492745: month=49%50%20=9, day=49 → invalid date (day>31)
  it("CZ - invalid date", () => expect(check("1103492745", "CZ")).toBe(false));

  // DK — CPR
  // 2110625629: day=21, month=10, year=62, c6='5', year>=58 → year=1862, valid date
  it("DK - valid no dash", () => expect(check("2110625629", "DK")).toBe(true));
  it("DK - valid with dash", () => expect(check("211062-5629", "DK")).toBe(true));
  // 3210625629: day=32 → invalid date
  it("DK - invalid date", () => expect(check("3210625629", "DK")).toBe(false));

  // EE — same as LT
  // 37605030299: sum%11=9, last=9 ✓
  it("EE - valid", () => expect(check("37605030299", "EE")).toBe(true));
  // 37605030298: sum%11=9 but last=8 → invalid checksum
  it("EE - invalid checksum", () => expect(check("37605030298", "EE")).toBe(false));

  // ES — DNI/NIE/CIF
  // 54362315K: 54362315%23=21 → 'K' ✓
  it("ES - valid DNI", () => expect(check("54362315K", "ES")).toBe(true));
  // 54362315Z: check='K' but last='Z' → invalid
  it("ES - invalid DNI", () => expect(check("54362315Z", "ES")).toBe(false));
  // X5825579R: 05825579%23 → check='R' ✓
  it("ES - valid NIE", () => expect(check("X5825579R", "ES")).toBe(true));
  // X5825579C: check='R' but last='C' → invalid
  it("ES - invalid NIE", () => expect(check("X5825579C", "ES")).toBe(false));
  // A58818501: CIF, sum=29, lastDigit=1, control='1' ✓
  it("ES - valid CIF", () => expect(check("A58818501", "ES")).toBe(true));
  // A58818502: control should be '1' but last='2' → invalid
  it("ES - invalid CIF", () => expect(check("A58818502", "ES")).toBe(false));

  // FI — HETU
  // 311280-888Y: n=311280888, n%31=30 → 'Y' ✓
  it("FI - valid", () => expect(check("311280-888Y", "FI")).toBe(true));
  // 311280-8883: check='Y' but last='3' → invalid checksum
  it("FI - invalid checksum", () => expect(check("311280-8883", "FI")).toBe(false));
  // 321280-888Y: day=32 → invalid date
  it("FI - invalid date", () => expect(check("321280-888Y", "FI")).toBe(false));

  // FR — NIR
  // 195017530058990: cog='75' (numeric), 1950175300589%97=7, 97-7=90, last 2 chars='90' ✓
  it("FR - valid mainland", () => expect(check("195017530058990", "FR")).toBe(true));
  // 195017530058991: check='90' but last 2 chars='91' → invalid checksum
  it("FR - invalid checksum", () => expect(check("195017530058991", "FR")).toBe(false));

  // HK — HKID
  // A1234563: single-letter prefix, sum=481, 481%11=8, 11-8=3 ✓
  it("HK - valid one-letter prefix", () => expect(check("A1234563", "HK")).toBe(true));
  // AB1234569: two-letter prefix, sum=255, 255%11=2, 11-2=9 ✓
  it("HK - valid two-letter prefix", () => expect(check("AB1234569", "HK")).toBe(true));
  // A1234564: check=3 but last='4' → invalid
  it("HK - invalid checksum", () => expect(check("A1234564", "HK")).toBe(false));

  // HR — OIB (mod11And10)
  it("HR - valid", () => expect(check("33392005961", "HR")).toBe(true));
  it("HR - invalid checksum", () => expect(check("33392005962", "HR")).toBe(false));
  it("HR - invalid length", () => expect(check("3339200596", "HR")).toBe(false));

  // ID — Aadhaar (Verhoeff)
  // 234123412346: starts with '2', 12 digits, verhoeff=true ✓
  it("ID - valid", () => expect(check("234123412346", "ID")).toBe(true));
  // 134123412346: starts with '1' → fails /^[2-9]\d{11}$/ → invalid
  it("ID - invalid starts with 1", () => expect(check("134123412346", "ID")).toBe(false));
  // 12345678901: 11 digits → invalid length
  it("ID - invalid length", () => expect(check("12345678901", "ID")).toBe(false));

  // IE — PPS
  // 1234567T: sum=112, alphabet[112%23]=alphabet[20]='T' ✓
  it("IE - valid old format", () => expect(check("1234567T", "IE")).toBe(true));
  // 1234567TW: 2013 format, getCheckDigit('1234567'+'W')→'T', value[7]='T' ✓
  it("IE - valid 2013 format", () => expect(check("1234567TW", "IE")).toBe(true));
  // 1234567A: check='T' but last='A' → invalid
  it("IE - invalid checksum", () => expect(check("1234567A", "IE")).toBe(false));

  // IL — Mispar Zehut (Luhn)
  // 3456787: luhn=true ✓
  it("IL - valid", () => expect(check("3456787", "IL")).toBe(true));
  // 3456786: luhn=false → invalid
  it("IL - invalid", () => expect(check("3456786", "IL")).toBe(false));

  // IS — Kennitala
  // 120174-3399: day=12, month=01, year=1974, weight sum=79, check=9, v[8]=9 ✓
  it("IS - valid with dash", () => expect(check("120174-3399", "IS")).toBe(true));
  it("IS - valid no dash", () => expect(check("1201743399", "IS")).toBe(true));
  // 120174-3389: v[8]=8 but check=9 → invalid checksum
  it("IS - invalid checksum", () => expect(check("120174-3389", "IS")).toBe(false));

  // KR — RRN
  // 9001011234568: weights sum=124, cd=(11-124%11)%10=8, last=8 ✓
  it("KR - valid", () => expect(check("9001011234568", "KR")).toBe(true));
  // 9001011234560: cd=8 but last=0 → invalid checksum
  it("KR - invalid checksum", () => expect(check("9001011234560", "KR")).toBe(false));

  // LT — Asmens kodas
  // 37605030299: sum%11=9, last=9 ✓
  it("LT - valid", () => expect(check("37605030299", "LT")).toBe(true));
  // 37605030298: sum%11=9 but last=8 → invalid checksum
  it("LT - invalid checksum", () => expect(check("37605030298", "LT")).toBe(false));
  // 37605030290: sum%11=9 but last=0 → invalid checksum
  it("LT - invalid checksum (zero)", () => expect(check("37605030290", "LT")).toBe(false));

  // LV — Personas kods
  // 161175-19997: day=16, month=11, year=1975, weight sum=248, check=7, last=7 ✓
  it("LV - valid", () => expect(check("161175-19997", "LV")).toBe(true));
  // 161175-19998: check=7 but last=8 → invalid checksum
  it("LV - invalid checksum", () => expect(check("161175-19998", "LV")).toBe(false));

  // ME — JMBG, rr 20-29
  // 0101990210005: rr=21 (in 20-29), checksum k=5 ✓
  it("ME - valid", () => expect(check("0101990210005", "ME")).toBe(true));
  // 1302968175017: rr=17, ME needs 20-29 → invalid region
  it("ME - invalid region (rr=17)", () => expect(check("1302968175017", "ME")).toBe(false));

  // MK — JMBG, rr 41-49
  // 0101990410004: rr=41 (in 41-49), checksum k=4 ✓
  it("MK - valid", () => expect(check("0101990410004", "MK")).toBe(true));
  // 1302968175017: rr=17, MK needs 41-49 → invalid region
  it("MK - invalid region (rr=17)", () => expect(check("1302968175017", "MK")).toBe(false));

  // MX — CURP
  // BOXW530507MNEXNN09: state=NE (valid), date=1953-05-07, gender=M, check=9 ✓
  it("MX - valid", () => expect(check("BOXW530507MNEXNN09", "MX")).toBe(true));
  // CACA530507MNEXNN09: first 4=CACA → blacklisted → invalid
  it("MX - invalid blacklist name", () =>
    expect(check("CACA530507MNEXNN09", "MX")).toBe(false));
  // BOXW530507MNEXNN00: check=9 but last=0 → invalid checksum
  it("MX - invalid checksum", () =>
    expect(check("BOXW530507MNEXNN00", "MX")).toBe(false));

  // MY — IC
  // 571014018952: DOB=1957-10-14, POB='01' (valid) ✓
  it("MY - valid", () => expect(check("571014018952", "MY")).toBe(true));
  // 571014178952: POB='17' → in notAvailablePlaces → invalid
  it("MY - invalid place of birth 17", () =>
    expect(check("571014178952", "MY")).toBe(false));
  // 993214018952: month=32 → invalid date
  it("MY - invalid date", () => expect(check("993214018952", "MY")).toBe(false));

  // NL — BSN
  // 111222333: sum=69, 69%11=3 (not 10), check=3, last=3 ✓
  it("NL - valid", () => expect(check("111222333", "NL")).toBe(true));
  // 111222334: check=3 but last=4 → invalid checksum
  it("NL - invalid checksum", () => expect(check("111222334", "NL")).toBe(false));
  // 1234567: length=7 < 8 → invalid too short
  it("NL - invalid too short", () => expect(check("1234567", "NL")).toBe(false));

  // NO — Fødselsnummer
  // 01015200193: cd1=9, cd2=3, both match ✓
  it("NO - valid", () => expect(check("01015200193", "NO")).toBe(true));
  // 01015200194: cd1=9 ✓ but cd2=3 != 4 → invalid
  it("NO - invalid checksum", () => expect(check("01015200194", "NO")).toBe(false));

  // PE — CUI
  // 12345678: 8 digits → valid directly (no check needed)
  it("PE - valid 8 digits", () => expect(check("12345678", "PE")).toBe(true));
  // 123456781: 9 digits, sum=138, cd=6, checkDigit=[6,5,4,3,2,1,1,0,9,8,7][6]=1, last=1 ✓
  it("PE - valid 9 digits with check", () => expect(check("123456781", "PE")).toBe(true));
  // 1234567: 7 digits → fails /^\d{8}[0-9A-Z]*$/ → invalid
  it("PE - invalid pattern", () => expect(check("1234567", "PE")).toBe(false));

  // PL — PESEL
  // 44051401359: sum=101, 101%10=1, check=10-1=9, last=9 ✓
  it("PL - valid", () => expect(check("44051401359", "PL")).toBe(true));
  // 44051401358: check=9 but last=8 → invalid checksum
  it("PL - invalid checksum", () => expect(check("44051401358", "PL")).toBe(false));
  // 4405140135: 10 digits → fails /^[0-9]{11}$/ → invalid
  it("PL - invalid length", () => expect(check("4405140135", "PL")).toBe(false));

  // RO — CNP
  // 1630615123457: gender=1 (1900s), year=1963, month=6, day=15, check=7, last=7 ✓
  it("RO - valid male 1900s", () => expect(check("1630615123457", "RO")).toBe(true));
  // 0630615123457: gender=0 → immediately invalid
  it("RO - invalid gender 0", () => expect(check("0630615123457", "RO")).toBe(false));
  // 1630615123456: check=7 but last=6 → invalid checksum
  it("RO - invalid checksum", () => expect(check("1630615123456", "RO")).toBe(false));

  // RS — JMBG, rr 70-99
  // 0101990710008: rr=71 (in 70-99), checksum k=8 ✓
  it("RS - valid", () => expect(check("0101990710008", "RS")).toBe(true));
  // 1302968175017: rr=17, RS needs 70-99 → invalid region
  it("RS - invalid region (rr=17)", () => expect(check("1302968175017", "RS")).toBe(false));

  // SE — personnummer
  // 6403273813: year=1964, month=03, day=27, luhn=true ✓
  it("SE - valid 10 digits", () => expect(check("6403273813", "SE")).toBe(true));
  it("SE - valid with dash", () => expect(check("640327-3813", "SE")).toBe(true));
  // 6403273814: luhn=false → invalid checksum
  it("SE - invalid checksum", () => expect(check("6403273814", "SE")).toBe(false));

  // SI — JMBG, rr 50-59
  // 0101006500006: rr=50 (in 50-59), checksum k=6 ✓
  it("SI - valid", () => expect(check("0101006500006", "SI")).toBe(true));
  // 1302968175017: rr=17, SI needs 50-59 → invalid region
  it("SI - invalid region (rr=17)", () => expect(check("1302968175017", "SI")).toBe(false));

  // SK — same as CZ
  it("SK - valid", () => expect(check("7103192745", "SK")).toBe(true));
  // 1103492745: day=49 → invalid date
  it("SK - invalid date", () => expect(check("1103492745", "SK")).toBe(false));

  // SM — 5 digits
  it("SM - valid", () => expect(check("12345", "SM")).toBe(true));
  it("SM - invalid too short", () => expect(check("1234", "SM")).toBe(false));
  it("SM - invalid too long", () => expect(check("123456", "SM")).toBe(false));

  // TH — 13 digits
  // 3100600564481: sum=209, (11-209%11)%10=(11-0)%10=1, last=1 ✓
  it("TH - valid", () => expect(check("3100600564481", "TH")).toBe(true));
  // 3100600564482: check=1 but last=2 → invalid checksum
  it("TH - invalid checksum", () => expect(check("3100600564482", "TH")).toBe(false));
  // 310060056448: 12 digits → invalid length
  it("TH - invalid length", () => expect(check("310060056448", "TH")).toBe(false));

  // TR — Turkish ID
  // 10000000146: sum of first 10 digits=6, 6%10=6=last ✓
  it("TR - valid", () => expect(check("10000000146", "TR")).toBe(true));
  // 10000000147: sum=6, 6%10=6 but last=7 → invalid checksum
  it("TR - invalid checksum", () => expect(check("10000000147", "TR")).toBe(false));
  // 1000000014: 10 digits → invalid length
  it("TR - invalid length", () => expect(check("1000000014", "TR")).toBe(false));

  // TW — Taiwan
  // A123456789: letterIndex=10, letterValue=1, sum=120, total=130, 130%10=0 ✓
  it("TW - valid", () => expect(check("A123456789", "TW")).toBe(true));
  // A123456788: total=130-1=129? Let me restate: total=letterValue+sum+last
  //   with last=8: 1+120+8=129, 129%10=9 ≠ 0 → invalid
  it("TW - invalid checksum", () => expect(check("A123456788", "TW")).toBe(false));
  // 1123456789: first char='1', not in [A-Z] → fails regex → invalid
  it("TW - invalid pattern", () => expect(check("1123456789", "TW")).toBe(false));

  // UY — 8 digits
  // 12345672: sum=148, 148%10=8, check=10-8=2, last=2 ✓
  it("UY - valid", () => expect(check("12345672", "UY")).toBe(true));
  // 12345671: check=2 but last=1 → invalid checksum
  it("UY - invalid checksum", () => expect(check("12345671", "UY")).toBe(false));
  // 1234567: 7 digits → fails /^\d{8}$/ → invalid
  it("UY - invalid length", () => expect(check("1234567", "UY")).toBe(false));

  // ZA — South Africa
  // 2001014800086: DOB=2020-01-01, luhn=true ✓
  it("ZA - valid", () => expect(check("2001014800086", "ZA")).toBe(true));
  // 2001014800087: luhn=false → invalid checksum
  it("ZA - invalid checksum", () => expect(check("2001014800087", "ZA")).toBe(false));
});
