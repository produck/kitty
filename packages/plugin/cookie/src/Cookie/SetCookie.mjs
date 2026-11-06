import { Is, ThrowTypeError } from '@produck/argot';

const AV_OCTETS = /^[\x21-\x3a\x3c-\x7e]+$/;

const SAME_SITE_MAP = new Map([
  ['strict', 'Strict'],
  ['lax', 'Lax'],
  ['none', 'None'],
]);

export function normalizeOptions(_options = {}) {
  if (!Is.PlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const options = {
    path: '/',
    domain: null,
    maxAge: null,
    expires: null,
    secure: false,
    httpOnly: true,
    sameSite: 'Lax',
  };

  const {
    path: _path = options.path,
    domain: _domain = options.domain,
    maxAge: _maxAge = options.maxAge,
    expires: _expires = options.expires,
    secure: _secure = options.secure,
    httpOnly: _httpOnly = options.httpOnly,
    sameSite: _sameSite = options.sameSite,
  } = _options;

  if (Is.Type.String(_path) && AV_OCTETS.test(_path)) {
    options.path = _path;
  } else {
    ThrowTypeError('args[0].path', 'non-empty string of av-octet characters');
  }

  if (Is.Type.Boolean(_secure)) {
    options.secure = _secure;
  } else {
    ThrowTypeError('args[0].secure', 'boolean');
  }

  if (Is.Type.Boolean(_httpOnly)) {
    options.httpOnly = _httpOnly;
  } else {
    ThrowTypeError('args[0].httpOnly', 'boolean');
  }

  if (
    _domain === null ||
    (Is.Type.String(_domain) && AV_OCTETS.test(_domain))
  ) {
    options.domain = _domain;
  } else {
    ThrowTypeError('args[0].domain', 'non-empty string of av-octet characters');
  }

  if (_maxAge === null || Number.isInteger(_maxAge)) {
    options.maxAge = _maxAge;
  } else {
    ThrowTypeError('args[0].maxAge', 'integer in seconds');
  }

  if (
    _expires === null ||
    (Is.Instance.Date(_expires) && !Number.isNaN(_expires.getTime()))
  ) {
    options.expires = _expires;
  } else {
    ThrowTypeError('args[0].expires', 'valid Date');
  }

  if (Is.Type.String(_sameSite) && SAME_SITE_MAP.has(_sameSite.toLowerCase())) {
    options.sameSite = SAME_SITE_MAP.get(_sameSite.toLowerCase());
  } else {
    ThrowTypeError('args[0].sameSite', 'strict | lax | none');
  }

  if (options.sameSite === 'None' && !options.secure) {
    ThrowTypeError('args[0].sameSite', 'none only with secure');
  }

  return options;
}

export function serialize(record) {
  const partList = [`${record.name}=${record.value}`];

  if (record.expires !== null) {
    partList.push(`Expires=${record.expires.toUTCString()}`);
  }

  if (record.maxAge !== null) {
    partList.push(`Max-Age=${record.maxAge}`);
  }

  if (record.domain !== null) {
    partList.push(`Domain=${record.domain}`);
  }

  partList.push(`Path=${record.path}`);

  if (record.secure) {
    partList.push('Secure');
  }

  if (record.httpOnly) {
    partList.push('HttpOnly');
  }

  partList.push(`SameSite=${record.sameSite}`);

  return partList.join('; ');
}
