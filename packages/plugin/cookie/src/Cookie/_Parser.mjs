export * from '../_Parser.mjs';

import { Is, Ow, ThrowTypeError } from '@produck/argot';

const AV_OCTETS = /^[\x21-\x3a\x3c-\x7e]+$/;

const SAME_SITE_MAP = new Map([
  ['strict', 'Strict'],
  ['lax', 'Lax'],
  ['none', 'None'],
]);

const OPTION_NAME_LIST = [
  'path',
  'domain',
  'maxAge',
  'expires',
  'secure',
  'httpOnly',
  'sameSite',
];

function AVOctets(value) {
  if (!Is.Type.String(value) || !AV_OCTETS.test(value)) {
    ThrowTypeError('member', 'a non-empty string of av-octet characters');
  }

  return value;
}

function BooleanOf(value) {
  if (!Is.Type.Boolean(value)) {
    ThrowTypeError('member', 'boolean');
  }

  return value;
}

function SameSiteOf(value) {
  const sameSite = Is.Type.String(value)
    ? SAME_SITE_MAP.get(value.toLowerCase())
    : undefined;

  if (sameSite === undefined) {
    ThrowTypeError('member', 'strict | lax | none');
  }

  return sameSite;
}

function MaxAgeOf(value) {
  if (!Number.isInteger(value)) {
    ThrowTypeError('member', 'an integer in seconds');
  }

  return value;
}

function ExpiresOf(value) {
  if (!Is.Instance.Date(value) || Number.isNaN(value.getTime())) {
    ThrowTypeError('member', 'a valid Date');
  }

  return value;
}

export function CookieOptions(value) {
  if (value === undefined) {
    value = {};
  } else if (!Is.Type.Object(value) || value === null || Array.isArray(value)) {
    ThrowTypeError('args[2] as options', 'CookieOptions');
  }

  for (const name of Object.keys(value)) {
    if (!OPTION_NAME_LIST.includes(name)) {
      ThrowTypeError(
        'args[2] as options',
        `an own key of ${OPTION_NAME_LIST.join(' | ')}`,
      );
    }
  }

  const options = {
    path: value.path === undefined ? '/' : AVOctets(value.path),
    secure: value.secure === undefined ? false : BooleanOf(value.secure),
    httpOnly: value.httpOnly === undefined ? true : BooleanOf(value.httpOnly),
    sameSite: value.sameSite === undefined ? 'Lax' : SameSiteOf(value.sameSite),
  };

  if (value.domain !== undefined) {
    options.domain = AVOctets(value.domain);
  }

  if (value.maxAge !== undefined) {
    options.maxAge = MaxAgeOf(value.maxAge);
  }

  if (value.expires !== undefined) {
    options.expires = ExpiresOf(value.expires);
  }

  if (options.sameSite === 'None' && !options.secure) {
    Ow.Error.Common('SameSite=None MUST be sent with Secure.');
  }

  return options;
}
