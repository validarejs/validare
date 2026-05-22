# Validators — Reference

All 50 built-in validators. Every validator returns `valid: true` for empty string (except `notEmpty`).

## Core (22)

| Validator | Description |
|---|---|
| [`notEmpty`](./notEmpty.md) | Field must not be empty |
| [`email`](./email.md) | Valid email address |
| [`creditCard`](./creditCard.md) | Credit card number (Luhn checksum) |
| [`date`](./date.md) | Date matching a given format |
| [`digits`](./digits.md) | Digits only (0–9) |
| [`integer`](./integer.md) | Whole number, positive or negative |
| [`numeric`](./numeric.md) | Any number, supports custom separators |
| [`regexp`](./regexp.md) | Value matches a regular expression |
| [`uri`](./uri.md) | Valid URL |
| [`identical`](./identical.md) | Equal to another field or value |
| [`different`](./different.md) | Different from another field or value |
| [`between`](./between.md) | Number between min and max |
| [`greaterThan`](./greaterThan.md) | Number greater than (or equal to) min |
| [`lessThan`](./lessThan.md) | Number less than (or equal to) max |
| [`stringLength`](./stringLength.md) | String length within min/max bounds |
| [`stringCase`](./stringCase.md) | All uppercase or all lowercase |
| [`choice`](./choice.md) | Number of selected checkboxes within range |
| [`file`](./file.md) | File type and/or size constraints |
| [`callback`](./callback.md) | Custom synchronous validation function |
| [`promise`](./promise.md) | Custom async validation function |
| [`remote`](./remote.md) | Remote server validation via fetch |
| [`ip`](./ip.md) | IPv4 or IPv6 address |

## Format & Encoding (6)

| Validator | Description |
|---|---|
| [`base64`](./base64.md) | Valid Base64 encoded string |
| [`hex`](./hex.md) | Hexadecimal number |
| [`mac`](./mac.md) | MAC address |
| [`bic`](./bic.md) | BIC/SWIFT code |
| [`uuid`](./uuid.md) | UUID (v1–v5) |
| [`color`](./color.md) | CSS color value |

## Financial Instruments (6)

| Validator | Description |
|---|---|
| [`iban`](./iban.md) | International Bank Account Number (77 countries) |
| [`vat`](./vat.md) | VAT number by country |
| [`cusip`](./cusip.md) | CUSIP security identifier |
| [`isin`](./isin.md) | International Securities Identification Number |
| [`sedol`](./sedol.md) | SEDOL (London Stock Exchange) |
| [`grid`](./grid.md) | Global Release Identifier (GRId) |

## Publication Codes (4)

| Validator | Description |
|---|---|
| [`ean`](./ean.md) | EAN barcode (EAN-8 or EAN-13) |
| [`isbn`](./isbn.md) | ISBN-10 or ISBN-13 |
| [`ismn`](./ismn.md) | International Standard Music Number |
| [`issn`](./issn.md) | International Standard Serial Number |

## Device & Vehicle (5)

| Validator | Description |
|---|---|
| [`imei`](./imei.md) | International Mobile Equipment Identity |
| [`imo`](./imo.md) | IMO ship number |
| [`meid`](./meid.md) | Mobile Equipment Identifier (CDMA) |
| [`step`](./step.md) | Multiple of a step value |
| [`vin`](./vin.md) | Vehicle Identification Number (USA) |

## Tax & Business (4)

| Validator | Description |
|---|---|
| [`ein`](./ein.md) | US Employer Identification Number |
| [`rtn`](./rtn.md) | US Routing Transit Number |
| [`siren`](./siren.md) | French company identifier |
| [`siret`](./siret.md) | French establishment identifier |

## Identity & Geographic (3)

| Validator | Description |
|---|---|
| [`id`](./id.md) | National identification number (42 countries) |
| [`phone`](./phone.md) | Phone number by country |
| [`zipCode`](./zipCode.md) | Postal/ZIP code by country |
