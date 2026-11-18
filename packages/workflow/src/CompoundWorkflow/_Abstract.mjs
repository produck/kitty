import { CONSTRUCTOR, Ow, ThrowTypeError } from '@produck/argot';
import { isSubConstructor } from '@produck/is-sub-constructor';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import * as DeployerRegistry from './DeployerRegistry/index.mjs';
import * as Configuration from './Configuration/index.mjs';
import * as Plugin from './Plugin/index.mjs';
import * as Deployment from '../Workflow/Deployment/index.mjs';
import * as Workflow from '../Workflow/index.mjs';

import * as P from './_Parser.mjs';
import { _A, DEPLOYER, DEPLOYMENT, PLUGIN, WORKFLOW } from './_Borrow.mjs';
import { $I, _I, I } from './_Symbol.mjs';

class CompoundWorkflow extends Workflow.Abstract {
  [I.DEPLOYER_REGISTRY] = new DeployerRegistry.Concrete();

  get DeployerRegistry() {
    return this[I.DEPLOYER_REGISTRY];
  }

  [I.PLUGIN.HANDLER_PREFIX_LIST] = [];
  [I.PLUGIN.DEPLOYMENT_ATTACHER_LIST] = [];
  [I.PLUGIN.EXCHANGE_ATTACHER_LIST] = [];

  [$I.STATE] = {
    RequestBodyDistributor: null,
  };

  constructor(...args) {
    super(...args);
    this[CONSTRUCTOR] = new.target;
    Configuration.install($(this));
  }

  [$I.APPEND.PREFIX_HANDLER](...handlerList) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN.HANDLER_PREFIX_LIST].push(...handlerList);
  }

  [$I.APPEND.DEPLOYMENT_ATTACHER](attacher) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN.DEPLOYMENT_ATTACHER_LIST].push(attacher);
  }

  [$I.APPEND.EXCHANGE_ATTACHER](attacher) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.PLUGIN.EXCHANGE_ATTACHER_LIST].push(attacher);
  }

  [$I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
    return this[_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value);
  }

  [WORKFLOW._I.COMPOSE.EXTEND]() {
    Object.freeze(this[I.PLUGIN.HANDLER_PREFIX_LIST]);
    this[WORKFLOW.$I.COMPOSE.PREPEND](...this[I.PLUGIN.HANDLER_PREFIX_LIST]);
  }

  [WORKFLOW._I.COMPILE_DEPLOYMENT](deployment, TargetDeployer) {
    const DeploymentKit = deployment[DEPLOYMENT.$I.KIT];

    for (const attacher of this[I.PLUGIN.DEPLOYMENT_ATTACHER_LIST]) {
      attacher(DeploymentKit);
    }

    const server = deployment[DEPLOYMENT.$I.SERVER];

    if (TargetDeployer === undefined) {
      TargetDeployer =
        this[I.DEPLOYER_REGISTRY][_A.REGISTRY.$I.RESOLVE](server);
    }

    if (TargetDeployer === undefined) {
      Ow.Error.Common(`No deployer for ${server.constructor.name}.`);
    }

    const deployer = new TargetDeployer(DeploymentKit, deployment);

    deployer[DEPLOYER.$I.INSTALL]();

    for (const attacher of this[I.PLUGIN.EXCHANGE_ATTACHER_LIST]) {
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

  mountDeployer(TargetDeployer) {
    this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
    this[I.DEPLOYER_REGISTRY].register(TargetDeployer);

    return this;
  }

  pickDeployer(TargetDeployer) {
    P.SubDeployer(TargetDeployer);

    const DeploymentKitName = 'Kitty<Deployment:OneTime>';
    let consumed = false;
    const compile = async (server) => {
      this[WORKFLOW.$I.ASSERT.FINALIZED]();

      if (consumed) {
        Ow.Error.Common('One-time deployer has already been used.');
      }

      consumed = true;

      const deployment = new Deployment.Concrete(this[WORKFLOW.$I.KIT], this, {
        server,
        kitName: DeploymentKitName,
      });

      await this[WORKFLOW._I.COMPILE_DEPLOYMENT](deployment, TargetDeployer);

      return deployment;
    };

    return Object.freeze({
      compile,
      async deploy(server) {
        const deployment = await compile(server);

        deployment.link();
      },
    });
  }

  mountPlugin(TargetPlugin) {
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
