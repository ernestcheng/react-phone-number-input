"use strict";

var _phoneInputHelpers = require("./phoneInputHelpers");

var _metadataMin = _interopRequireDefault(require("libphonenumber-js/metadata.min.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

describe('phoneInputHelpers', function () {
  it('should get pre-selected country', function () {
    // Can't return "International". Return the first country available.
    (0, _phoneInputHelpers.getPreSelectedCountry)({}, null, ['US', 'RU'], false, _metadataMin["default"]).should.equal('US'); // Can return "International".
    // Country can't be derived from the phone number.

    expect((0, _phoneInputHelpers.getPreSelectedCountry)({}, undefined, ['US', 'RU'], true, _metadataMin["default"])).to.be.undefined; // Derive country from the phone number.

    (0, _phoneInputHelpers.getPreSelectedCountry)({
      country: 'RU',
      phone: '8005553535'
    }, null, ['US', 'RU'], false, _metadataMin["default"]).should.equal('RU'); // Country derived from the phone number overrides the supplied one.

    (0, _phoneInputHelpers.getPreSelectedCountry)({
      country: 'RU',
      phone: '8005553535'
    }, 'US', ['US', 'RU'], false, _metadataMin["default"]).should.equal('RU'); // Only pre-select a country if it's in the available `countries` list.

    (0, _phoneInputHelpers.getPreSelectedCountry)({
      country: 'RU',
      phone: '8005553535'
    }, null, ['US', 'DE'], false, _metadataMin["default"]).should.equal('US');
    expect((0, _phoneInputHelpers.getPreSelectedCountry)({
      country: 'RU',
      phone: '8005553535'
    }, 'US', ['US', 'DE'], true, _metadataMin["default"])).to.be.undefined;
  });
  it('should generate country select options', function () {
    var defaultLabels = {
      'RU': 'Russia (Россия)',
      'US': 'United States',
      'ZZ': 'International'
    }; // Without custom country names.

    (0, _phoneInputHelpers.getCountrySelectOptions)(['US', 'RU'], defaultLabels, false).should.deep.equal([{
      value: 'RU',
      label: 'Russia (Россия)'
    }, {
      value: 'US',
      label: 'United States'
    }]); // With custom country names.

    (0, _phoneInputHelpers.getCountrySelectOptions)(['US', 'RU'], _objectSpread({}, defaultLabels, {
      'RU': 'Russia'
    }), false).should.deep.equal([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]); // With "International" (without custom country names).

    (0, _phoneInputHelpers.getCountrySelectOptions)(['US', 'RU'], defaultLabels, true).should.deep.equal([{
      label: 'International'
    }, {
      value: 'RU',
      label: 'Russia (Россия)'
    }, {
      value: 'US',
      label: 'United States'
    }]); // With "International" (with custom country names).

    (0, _phoneInputHelpers.getCountrySelectOptions)(['US', 'RU'], _objectSpread({}, defaultLabels, {
      'RU': 'Russia',
      ZZ: 'Intl'
    }), true).should.deep.equal([{
      label: 'Intl'
    }, {
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]);
  });
  it('should parse phone numbers', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+78005553535', _metadataMin["default"]);
    phoneNumber.country.should.equal('RU');
    phoneNumber.nationalNumber.should.equal('8005553535'); // No `value` passed.

    expect((0, _phoneInputHelpers.parsePhoneNumber)(null, _metadataMin["default"])).to.equal.undefined;
  });
  it('should generate national number digits', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+33509758351', _metadataMin["default"]);
    (0, _phoneInputHelpers.generateNationalNumberDigits)(phoneNumber).should.equal('0509758351');
  });
  it('should migrate parsed input for new country', function () {
    // No input. Returns `undefined`.
    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('', 'RU', 'US', _metadataMin["default"]).should.equal(''); // Switching from "International" to a country
    // to which the phone number already belongs to.
    // No changes. Returns `undefined`.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+18005553535', null, 'US', _metadataMin["default"]).should.equal('+18005553535'); // Switching between countries. National number. No changes.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('8005553535', 'RU', 'US', _metadataMin["default"]).should.equal('8005553535'); // Switching from "International" to a country.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+78005553535', null, 'US', _metadataMin["default"]).should.equal('+18005553535'); // Switching countries. International number.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+78005553535', 'RU', 'US', _metadataMin["default"]).should.equal('+18005553535'); // Switching countries. International number.
    // Country calling code is longer than the amount of digits available.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+99', 'KG', 'US', _metadataMin["default"]).should.equal('+1'); // Switching countries. International number. No such country code.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+99', 'KG', 'US', _metadataMin["default"]).should.equal('+1'); // Switching to "International". National number.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('8800555', 'RU', null, _metadataMin["default"]).should.equal('+7800555'); // Switching to "International". No national (significant) number digits entered.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('8', 'RU', null, _metadataMin["default"]).should.equal(''); // Switching to "International". International number. No changes.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+78005553535', 'RU', null, _metadataMin["default"]).should.equal('+78005553535'); // Prefer national format. Country matches. Leaves the "national (significant) number".

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+78005553535', null, 'RU', _metadataMin["default"], true).should.equal('8005553535'); // Prefer national format. Country doesn't match, but country calling code does. Leaves the "national (significant) number".

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+12133734253', null, 'CA', _metadataMin["default"], true).should.equal('2133734253'); // Prefer national format. Country doesn't match, neither does country calling code. Clears the value.

    (0, _phoneInputHelpers.migrateParsedInputForNewCountry)('+78005553535', null, 'US', _metadataMin["default"], true).should.equal('');
  });
  it('should format phone number in e164', function () {
    // No number.
    expect((0, _phoneInputHelpers.e164)()).to.be.undefined; // International number. Just a '+' sign.

    expect((0, _phoneInputHelpers.e164)('+')).to.be.undefined; // International number.

    (0, _phoneInputHelpers.e164)('+7800').should.equal('+7800'); // National number. Without country.

    expect((0, _phoneInputHelpers.e164)('8800', null)).to.be.undefined; // National number. With country. Just national prefix.

    expect((0, _phoneInputHelpers.e164)('8', 'RU', _metadataMin["default"])).to.be.undefined; // National number. With country.

    (0, _phoneInputHelpers.e164)('8800', 'RU', _metadataMin["default"]).should.equal('+7800');
  });
  it('should trim the phone number if it exceeds the maximum length', function () {
    // // No number.
    // expect(trimNumber()).to.be.undefined
    // Empty number.
    expect((0, _phoneInputHelpers.trimNumber)('', 'RU', _metadataMin["default"])).to.equal(''); // // International number. Without country.
    // trimNumber('+780055535351').should.equal('+780055535351')
    // // National number. Without country.
    // trimNumber('880055535351', null).should.equal('880055535351')
    // National number. Doesn't exceed the maximum length.

    (0, _phoneInputHelpers.trimNumber)('88005553535', 'RU', _metadataMin["default"]).should.equal('88005553535'); // National number. Exceeds the maximum length.

    (0, _phoneInputHelpers.trimNumber)('880055535351', 'RU', _metadataMin["default"]).should.equal('88005553535'); // International number. Doesn't exceed the maximum length.

    (0, _phoneInputHelpers.trimNumber)('+78005553535', 'RU', _metadataMin["default"]).should.equal('+78005553535'); // International number. Exceeds the maximum length.

    (0, _phoneInputHelpers.trimNumber)('+780055535351', 'RU', _metadataMin["default"]).should.equal('+78005553535');
  });
  it('should get country for partial E.164 number', function () {
    // Just a '+' sign.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+', 'RU', ['US', 'RU'], true, _metadataMin["default"]).should.equal('RU');
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+', undefined, ['US', 'RU'], true, _metadataMin["default"])).to.be.undefined; // A country can be derived.

    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+78005553535', undefined, ['US', 'RU'], true, _metadataMin["default"]).should.equal('RU'); // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.

    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', 'FR', ['FR', 'RU'], true, _metadataMin["default"])).to.be.undefined;
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+12', 'FR', ['FR', 'US'], true, _metadataMin["default"])).to.be.undefined; // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.
    // Bit "International" option is not available.

    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', 'FR', ['FR', 'RU'], false, _metadataMin["default"]).should.equal('FR');
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+12', 'FR', ['FR', 'US'], false, _metadataMin["default"]).should.equal('FR');
  });
  it('should get country from possibly incomplete international phone number', function () {
    // `001` country calling code.
    expect((0, _phoneInputHelpers.get_country_from_possibly_incomplete_international_phone_number)('+800', _metadataMin["default"])).to.be.undefined; // Country can be derived.

    (0, _phoneInputHelpers.get_country_from_possibly_incomplete_international_phone_number)('+33', _metadataMin["default"]).should.equal('FR'); // Country can't be derived yet.

    expect((0, _phoneInputHelpers.get_country_from_possibly_incomplete_international_phone_number)('+12', _metadataMin["default"])).to.be.undefined;
  });
  it('should compare strings', function () {
    (0, _phoneInputHelpers.compare_strings)('aa', 'ab').should.equal(-1);
    (0, _phoneInputHelpers.compare_strings)('aa', 'aa').should.equal(0);
    (0, _phoneInputHelpers.compare_strings)('aac', 'aab').should.equal(1);
  });
  it('should strip country calling code from a number', function () {
    // Number is longer than country calling code prefix.
    (0, _phoneInputHelpers.strip_country_calling_code)('+7800', 'RU', _metadataMin["default"]).should.equal('800'); // Number is shorter than (or equal to) country calling code prefix.

    (0, _phoneInputHelpers.strip_country_calling_code)('+3', 'FR', _metadataMin["default"]).should.equal('');
    (0, _phoneInputHelpers.strip_country_calling_code)('+7', 'FR', _metadataMin["default"]).should.equal(''); // `country` doesn't fit the actual `number`.
    // Iterates through all available country calling codes.

    (0, _phoneInputHelpers.strip_country_calling_code)('+7800', 'FR', _metadataMin["default"]).should.equal('800'); // No `country`.
    // And the calling code doesn't belong to any country.

    (0, _phoneInputHelpers.strip_country_calling_code)('+999', null, _metadataMin["default"]).should.equal('');
  });
  it('should get national significant number part', function () {
    // International number.
    (0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+7800555', null, _metadataMin["default"]).should.equal('800555'); // International number.
    // No national (significant) number digits.

    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+', null, _metadataMin["default"])).to.be.undefined;
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+7', null, _metadataMin["default"])).to.be.undefined; // National number.

    (0, _phoneInputHelpers.getNationalSignificantNumberDigits)('8800555', 'RU', _metadataMin["default"]).should.equal('800555'); // National number.
    // No national (significant) number digits.

    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('8', 'RU', _metadataMin["default"])).to.be.undefined;
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('', 'RU', _metadataMin["default"])).to.be.undefined;
  });
  it('should determine of a number could belong to a country', function () {
    // Matching.
    (0, _phoneInputHelpers.could_number_belong_to_country)('+7800', 'RU', _metadataMin["default"]).should.equal(true); // First digit already not matching.

    (0, _phoneInputHelpers.could_number_belong_to_country)('+7800', 'FR', _metadataMin["default"]).should.equal(false); // First digit matching, second - not matching.

    (0, _phoneInputHelpers.could_number_belong_to_country)('+33', 'AM', _metadataMin["default"]).should.equal(false); // Number is shorter than country calling code.

    (0, _phoneInputHelpers.could_number_belong_to_country)('+99', 'KG', _metadataMin["default"]).should.equal(true);
  });
  it('should parse input', function () {
    (0, _phoneInputHelpers.parseInput)(undefined, undefined, 'RU', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: undefined,
      country: 'RU',
      value: undefined
    });
    (0, _phoneInputHelpers.parseInput)('', undefined, undefined, undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '',
      country: undefined,
      value: undefined
    });
    (0, _phoneInputHelpers.parseInput)('+', undefined, undefined, undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+',
      country: undefined,
      value: undefined
    });
    (0, _phoneInputHelpers.parseInput)('1213', undefined, undefined, undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+1213',
      country: undefined,
      value: '+1213'
    });
    (0, _phoneInputHelpers.parseInput)('+1213', undefined, undefined, undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+1213',
      country: undefined,
      value: '+1213'
    });
    (0, _phoneInputHelpers.parseInput)('213', undefined, 'US', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '213',
      country: 'US',
      value: '+1213'
    });
    (0, _phoneInputHelpers.parseInput)('+78005553535', undefined, 'US', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+78005553535',
      country: 'RU',
      value: '+78005553535'
    }); // Won't reset an already selected country.

    (0, _phoneInputHelpers.parseInput)('+15555555555', undefined, 'US', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+15555555555',
      country: 'US',
      value: '+15555555555'
    }); // `limitMaxLength`.

    (0, _phoneInputHelpers.parseInput)('21337342530', undefined, 'US', undefined, undefined, true, true, _metadataMin["default"]).should.deep.equal({
      input: '2133734253',
      country: 'US',
      value: '+12133734253'
    });
    (0, _phoneInputHelpers.parseInput)('+121337342530', undefined, 'US', undefined, undefined, true, true, _metadataMin["default"]).should.deep.equal({
      input: '+12133734253',
      country: 'US',
      value: '+12133734253'
    }); // This case is intentionally ignored to simplify the code.

    (0, _phoneInputHelpers.parseInput)('+121337342530', undefined, undefined, undefined, undefined, true, true, _metadataMin["default"]).should.deep.equal({
      // input: '+12133734253',
      // country: 'US',
      // value: '+12133734253'
      input: '+121337342530',
      country: undefined,
      value: '+121337342530'
    }); // Should reset the country if it has likely been automatically
    // selected based on international phone number input
    // and the user decides to erase all input.

    (0, _phoneInputHelpers.parseInput)('', '+78005553535', 'RU', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '',
      country: undefined,
      value: undefined
    }); // Should reset the country if it has likely been automatically
    // selected based on international phone number input
    // and the user decides to erase all input.
    // Should reset to default country.

    (0, _phoneInputHelpers.parseInput)('', '+78005553535', 'RU', 'US', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '',
      country: 'US',
      value: undefined
    }); // Should reset the country if it has likely been automatically
    // selected based on international phone number input
    // and the user decides to erase all input up to the `+` sign.

    (0, _phoneInputHelpers.parseInput)('+', '+78005553535', 'RU', undefined, undefined, true, false, _metadataMin["default"]).should.deep.equal({
      input: '+',
      country: undefined,
      value: undefined
    });
  });
});
//# sourceMappingURL=phoneInputHelpers.test.js.map