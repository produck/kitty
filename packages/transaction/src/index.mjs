import * as Kit from '@produck/kit';

function TransactionCommonInstaller(_options) {
  return Kit.defineRecipe(function installTranscationCommonUsage(_kit) {});
}

export { TransactionCommonInstaller as Installer };

export * as Use from './Usage/index.mjs';
