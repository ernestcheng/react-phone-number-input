import metadata from 'libphonenumber-js/metadata.full.json'

import {
	parsePhoneNumber as _parsePhoneNumber,
	formatPhoneNumber as _formatPhoneNumber,
	formatPhoneNumberIntl as _formatPhoneNumberIntl,
	isValidPhoneNumber as _isValidPhoneNumber,
	isPossiblePhoneNumber as _isPossiblePhoneNumber,
	getCountries as _getCountries,
	getCountryCallingCode as _getCountryCallingCode
} from '../core/index'

import { createPhoneInput } from '../modules/PhoneInputWithCountryDefault'

function call(func, _arguments) {
	var args = Array.prototype.slice.call(_arguments)
	args.push(metadata)
	return func.apply(this, args)
}

export default createPhoneInput(metadata)

export function parsePhoneNumber() {
	return call(_parsePhoneNumber, arguments)
}

export function formatPhoneNumber() {
	return call(_formatPhoneNumber, arguments)
}

export function formatPhoneNumberIntl() {
	return call(_formatPhoneNumberIntl, arguments)
}

export function isValidPhoneNumber() {
	return call(_isValidPhoneNumber, arguments)
}

export function isPossiblePhoneNumber() {
	return call(_isPossiblePhoneNumber, arguments)
}

export function getCountries() {
	return call(_getCountries, arguments)
}

export function getCountryCallingCode() {
	return call(_getCountryCallingCode, arguments)
}