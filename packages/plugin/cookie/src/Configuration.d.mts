import type * as Workflow from '@produck/kitty-workflow';

export declare const Tune: Readonly<{
  Domain(workflow: Workflow.Abstract.Workflow, value: string | null): void;
  MaxAge(workflow: Workflow.Abstract.Workflow, value: number | null): void;
  Expires(workflow: Workflow.Abstract.Workflow, value: Date | null): void;
}>;

export declare const Get: Readonly<{
  Domain(workflow: Workflow.Abstract.Workflow): string | null;
  MaxAge(workflow: Workflow.Abstract.Workflow): number | null;
  Expires(workflow: Workflow.Abstract.Workflow): Date | null;
}>;

export declare interface Configuration {
  domain: string | null;
  maxAge: number | null;
  expires: Date | null;
}

export declare function installConfiguration(
  workflow: Workflow.Abstract.Workflow,
): Configuration;
