import * as Kit from '@produck/kit';

const CONTEXT = Symbol('Node::Http::Context');

export const { use, touch } = Kit.Getter(CONTEXT);

export default {
  /**
   * @param {Kit.KitProvider} kit
   * @param {[import('node:http').Server]} param1
   */
  deploy: async function NodeHttpDeploymentAdapter(_kit, [_server]) {
    const _httpServerKit = _kit('Kitty<HttpServer>');

    _server.addListener('request', (_request, _response) => {});
  },
};
