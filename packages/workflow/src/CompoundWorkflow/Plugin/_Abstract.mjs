import { ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import * as Kit from '@produck/kit';

import * as P from '../_Parser.mjs';
import { _A, WORKFLOW } from './_Borrow.mjs';
import { I, $I, _I } from './_Symbol.mjs';

class Plugin {
  constructor(WorkflowKit, workflow) {
    if (!Kit.isKit(WorkflowKit)) {
      ThrowTypeError('args[0] as WorkflowKit', 'Kit');
    }

    this[I.KIT] = WorkflowKit('Kitty<Plugin>');
    this[I.WORKFLOW] = workflow;
    this[I.ATTACH.WORKFLOW]();
    this[I.ATTACH.DEPLOYMENT_ATTACHER]();
    this[I.ATTACH.EXCHANGE_ATTACHER]();
    this[I.ATTACH.PREFIX_HANDLER]();
  }

  get [$I.KIT]() {
    return this[I.KIT];
  }

  get [$I.WORKFLOW]() {
    return this[I.WORKFLOW];
  }

  [I.ATTACH.WORKFLOW]() {
    this[I.KIT].attachWorkflow = (name, value) => {
      const workflow = this[I.WORKFLOW];

      workflow[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      P.DependenceName(name);
      workflow[WORKFLOW.$I.KIT][name] = value;
    };
  }

  [I.ATTACH.DEPLOYMENT_ATTACHER]() {
    this[I.KIT].appendDeploymentAttacher = (attacher) => {
      P.Attacher(attacher);
      this[I.WORKFLOW][_A.COMPOUND.$I.APPEND.DEPLOYMENT_ATTACHER](attacher);
    };
  }

  [I.ATTACH.EXCHANGE_ATTACHER]() {
    this[I.KIT].appendExchangeAttacher = (attacher) => {
      P.Attacher(attacher);
      this[I.WORKFLOW][_A.COMPOUND.$I.APPEND.EXCHANGE_ATTACHER](attacher);
    };
  }

  [I.ATTACH.PREFIX_HANDLER]() {
    this[I.KIT].appendPrefixHandler = (...handlerList) => {
      for (const index in handlerList) {
        P.Handler(handlerList[index], index);
      }

      this[I.WORKFLOW][_A.COMPOUND.$I.APPEND.PREFIX_HANDLER](...handlerList);
    };
  }

  [$I.INSTALL]() {
    return this[_I.INSTALL](this[I.KIT]);
  }
}

export default Abstract(
  Plugin,
  Abstract({
    [_I.INSTALL]: M.Method().args(P.Kit),
  }),
);
