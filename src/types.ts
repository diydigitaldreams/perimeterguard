export type GateMode = "observer" | "supervised" | "controlled" | "autonomous";
export type GateDecision = "pass" | "gate" | "block";

export interface RestrictedPeriod {
  start: string;
  end: string;
  note?: string;
}

export interface OperationConfig {
  operation: {
    name: string;
    start?: string;
    end?: string;
  };
  perimeter: {
    hosts: string[];
    domains: string[];
    cidrs: string[];
  };
  no_touch: {
    hosts: string[];
    cidrs: string[];
    restricted_periods: RestrictedPeriod[];
  };
  constraints: {
    blocked_tactics: string[];
    gated_tactics: string[];
  };
}

export interface AuthResult {
  cleared: boolean;
  reason: string;
}

export interface ClassifyResult {
  allowed: boolean;
  reason: string;
}

export interface DryRunResult {
  target: string;
  tactic: string;
  mode: GateMode;
  auth: AuthResult;
  classify: ClassifyResult;
  gate: GateDecision;
  cleared: boolean;
}
