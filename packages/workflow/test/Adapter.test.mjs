import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import * as Kitty from '../src/index.mjs';

describe('::Adapter', () => {
  describe('::define()', () => {
    it('should define a server adapter options.', () => {
      Kitty.Adapter.define({
        install: Kit.defineRecipe(function MockHttp(DeploymentKit, [handle]) {
          /** @type {{ server: import('node:http').Server }} */
          const { server } = Kitty.useDeployment(DeploymentKit);

          server.on('request', (_req, _res) => {
            const TransactionKit = DeploymentKit('Kitty<Transaction>');

            //TODO append useTransaction deps.

            handle(TransactionKit);
          });
        }),
      });
    });
  });
});
