export function serializeSetCookie(record) {
  const {
    name,
    value,
    path,
    domain,
    maxAge,
    expires,
    secure,
    httpOnly,
    sameSite,
  } = record;

  const partList = [`${name}=${value}`];

  if (expires !== undefined) {
    partList.push(`Expires=${expires.toUTCString()}`);
  }

  if (maxAge !== undefined) {
    partList.push(`Max-Age=${maxAge}`);
  }

  if (domain !== undefined) {
    partList.push(`Domain=${domain}`);
  }

  partList.push(`Path=${path}`);

  if (secure) {
    partList.push('Secure');
  }

  if (httpOnly) {
    partList.push('HttpOnly');
  }

  partList.push(`SameSite=${sameSite}`);

  return partList.join('; ');
}
