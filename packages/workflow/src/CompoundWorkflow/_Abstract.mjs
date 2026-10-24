import { Ow, ThrowTypeError } from '@produck/argot';
import { isSubConstructor } from '@produck/is-sub-constructor';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import * as Deployer from './Deployer/index.mjs';
import * as Configuration from './Configuration/index.mjs';
import * as Plugin from './Plugin/index.mjs';
import * as Workflow from '../Workflow/index.mjs';

import * as P from './_Parser.mjs';
import { $I, _I, I } from './_Symbol.mjs';
import { DEPLOYER, DEPLOYMENT, PLUGIN, WORKFLOW } from './_Borrow.mjs';

class CompoundWorkflow extends Workflow.Abstract {
  [I.PLUGIN_HANDLER_PREFIX_LIST] = [];
  [I.PLUGIN_DEPLOYMENT_ATTACHER_LIST] = [];
  [I.PLUGIN_EXCHANGE_ATTACHER_LIST] = [];

  [$I.STATE] = {
    RequestBodyDistributor: null,
  };

  constructor(...args) {
    super(...args);
    Configuration.install($(this));
  }

  [$I.APPEND.PREFIX_HANDLER](...handlerList) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN_HANDLER_PREFIX_LIST].push(...handlerList);
  }

  [$I.APPEND.DEPLOYMENT_ATTACHER](attacher) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN_DEPLOYMENT_ATTACHER_LIST].push(attacher);
  }

  [$I.APPEND.EXCHANGE_ATTACHER](attacher) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN_EXCHANGE_ATTACHER_LIST].push(attacher);
  }

  [$I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
    return this[_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value);
  }

  [WORKFLOW._I.COMPOSE.EXTEND]() {
    Object.freeze(this[I.PLUGIN_HANDLER_PREFIX_LIST]);
    this[WORKFLOW.$I.COMPOSE.PREPEND](...this[I.PLUGIN_HANDLER_PREFIX_LIST]);
  }

  [WORKFLOW._I.COMPILE_DEPLOYMENT](deployment) {
    const DeploymentKit = deployment[DEPLOYMENT.$I.KIT];

    for (const attacher of this[I.PLUGIN_DEPLOYMENT_ATTACHER_LIST]) {
      attacher(DeploymentKit);
    }

    const server = deployment[DEPLOYMENT.$I.SERVER];
    const TargetDeployer = Deployer.Registry.getByServer(server);
    const deployer = new TargetDeployer(DeploymentKit, deployment);

    deployer[DEPLOYER.$I.INSTALL]();

    for (const attacher of this[I.PLUGIN_EXCHANGE_ATTACHER_LIST]) {
      deployment[DEPLOYMENT.$I.ADD_EXCHANGE_ATTACHER](attacher);
    }

    deployment[DEPLOYMENT.$I.COMMIT]();
  }

  async [WORKFLOW.$I.DEPLOY](server, kitName) {
    if (this[$I.STATE].RequestBodyDistributor === null) {
      Ow.Error.Common('It MUST set a request body distributor.');
    }

    return super[WORKFLOW.$I.DEPLOY](server, kitName);
  }

  adapt(TargetDeployer) {
    this[WORKFLOW.$I.ASSERT.FINALIZED]();

    const DeploymentKitName = 'Kitty<Deployment:OneTime>';

    Deployer.Registry.assertDeployer(TargetDeployer);

    const Server = TargetDeployer[DEPLOYER._S.SERVER_CTOR];
    let expired = false;
    let consumed = false;

    queueMicrotask(() => (expired = true));

    function consumeBy(context, server) {
      if (context !== deployer) {
        Ow.Error.Common('Must consume through its deployer.');
      }

      if (!(server instanceof Server)) {
        ThrowTypeError('args[0] as server', Server.name);
      }

      if (consumed) {
        Ow.Error.Common('One-time deployer has already been used.');
      }

      if (expired) {
        Ow.Error.Common('One-time deployer MUST be consumed immediately.');
      }

      consumed = true;
      Deployer.Registry.associate(server, TargetDeployer);
    }

    const deployer = Object.freeze({
      compile: async (server) => {
        consumeBy(deployer, server);

        const deployment = await this[WORKFLOW.$I.COMPILE](
          server,
          DeploymentKitName,
        );

        return deployment.manifest;
      },
      deploy: async (server) => {
        consumeBy(deployer, server);
        await this[WORKFLOW.$I.DEPLOY](server, DeploymentKitName);
      },
    });

    return deployer;
  }

  mixin(TargetPlugin) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();

    if (!isSubConstructor(TargetPlugin, Plugin.Abstract)) {
      ThrowTypeError('args[0]', 'sub class of Plugin');
    }

    const WorkflowKit = this[WORKFLOW.$I.KIT];
    const plugin = new TargetPlugin(WorkflowKit, this);

    plugin[PLUGIN.$I.INSTALL]();

    return this;
  }

  setRequestBodyDistributorConstructor(Constructor) {
    if (!isSubConstructor(Constructor, Fugue.Distributor)) {
      ThrowTypeError('args[0]', 'sub class of Fugue.Distributor');
    }

    this[$I.STATE].RequestBodyDistributor = Constructor;

    return this;
  }
}

export default Abstract(
  CompoundWorkflow,
  Abstract({
    [_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA]: M.Method()
      .args(M.Any)
      .returns(P.ReadableStreamResult),
  }),
);
