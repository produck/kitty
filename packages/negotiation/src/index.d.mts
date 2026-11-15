export declare interface Spec {
  value: string;
  q: number;
}

export declare function assertCandidateList(candidateList: string[]): void;

export declare function defaultSpec(
  specList: Spec[],
  defaultValue: string,
): Spec[];

export declare function qualityOf(
  specList: Spec[],
  specificityOf: (value: string) => number,
): number;

export declare function SpecList(value: unknown): Spec[];
