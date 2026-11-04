import * as http2 from 'node:http2';

export const Http2SecureServer = http2.createSecureServer({}).constructor;
