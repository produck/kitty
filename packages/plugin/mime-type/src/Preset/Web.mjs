import * as Charset from './Charset.mjs';

const Web = [
  { alias: 'css', mimeType: 'text/css', charsetList: Charset.ANY },
  { alias: 'js', mimeType: 'text/javascript', charsetList: Charset.ANY },
  { alias: 'svg', mimeType: 'image/svg+xml', charsetList: Charset.ANY },
  { alias: 'png', mimeType: 'image/png', charsetList: [] },
  { alias: 'jpeg', mimeType: 'image/jpeg', charsetList: [] },
  { alias: 'jpg', mimeType: 'image/jpeg', charsetList: [] },
  { alias: 'gif', mimeType: 'image/gif', charsetList: [] },
  { alias: 'webp', mimeType: 'image/webp', charsetList: [] },
  { alias: 'ico', mimeType: 'image/x-icon', charsetList: [] },
  { alias: 'woff', mimeType: 'font/woff', charsetList: [] },
  { alias: 'woff2', mimeType: 'font/woff2', charsetList: [] },
  { alias: 'wasm', mimeType: 'application/wasm', charsetList: [] },
];

export default Web;
