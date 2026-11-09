import * as Charset from './Charset.mjs';

const Standard = [
  { alias: 'json', mimeType: 'application/json', charsetList: Charset.ANY },
  { alias: 'text', mimeType: 'text/plain', charsetList: Charset.ANY },
  { alias: 'html', mimeType: 'text/html', charsetList: Charset.ANY },
  { alias: 'xml', mimeType: 'application/xml', charsetList: Charset.ANY },
  { alias: 'xml', mimeType: 'text/xml', charsetList: Charset.ANY },
  {
    alias: 'form',
    mimeType: 'application/x-www-form-urlencoded',
    charsetList: Charset.ANY,
  },
  {
    alias: 'event-stream',
    mimeType: 'text/event-stream',
    charsetList: Charset.ANY,
  },
  { alias: 'multipart', mimeType: 'multipart/form-data', charsetList: [] },
  {
    alias: 'binary',
    mimeType: 'application/octet-stream',
    charsetList: [],
  },
];

export default Standard;
