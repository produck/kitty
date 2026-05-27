import * as Kit from '@produck/kit';

const STREAM = Symbol('Node::Http2::Stream');

export const useStream = Kit.Getter(STREAM);

export default {
  /**
   * @param {Kit.KitProvider} kit
   * @param {[import('node:http2').Http2Server]} param1
   */
  deploy: async function NodeHttpDeploymentAdapter(_kit, [_server]) {
    const _http2ServerKit = _kit('Kitty<Http2Server>');

    _server.addListener('stream', (_stream) => {
      const _streamKit = _http2ServerKit('Kitty<Http2Stream>');
    });
  },
};
