/**
 * PerimeterGuard — Scope enforcement library for security assessment tooling.
 * Zero dependencies. TypeScript-first.
 *
 * @author Jean Paul Serrano Melendez
 * @license MIT
 */

import { matchCIDR } from "./cidr";
import { matchHost, matchDomain, normalizeTarget } from "./matcher";
import type {
  OperationConfig,
  AuthResult,
  ClassifyResult,
  GateDecision,
  GateMode,
  DryRunResult,
} from "./types";

export { matchCIDR } from "./cidr";
export { matchHost, matchDomain, escapeRegex, normalizeTarget } from "./matcher";
export type {
  OperationConfig,
  AuthResult,
  ClassifyResult,
  GateDecision,
  GateMode,
  DryRunResult,
  RestrictedPeriod,
} from "./types";

export class PerimeterGuard {
  private op: OperationConfig;

  constructor(op: OperationConfig) {
    this.op = op;
  }

  /**
   * Full 3-check authorization:
   *   1. Time window (operation active, not in restricted period)
   *   2. Target in perimeter (not no-touch, inside authorized scope)
   *
   * Note: tactic + gate checks are separate — call classify() and gateCheck().
   * Use dryRun() to evaluate all checks at once without side effects.
   */
  authorize(target: string): AuthResult {
    if (!this.op || !target) {
      return { cleared: false, reason: "No operation or target" };
    }

    const now = new Date();

    // CHECK 1a: Operation window
    if (this.op.operation.start && now < new Date(this.op.operation.start)) {
      return { cleared: false, reason: "Operation not yet active" };
    }
    if (this.op.operation.end && now > new Date(this.op.operation.end)) {
      return { cleared: false, reason: "Operation window closed" };
    }

    // CHECK 1b: Restricted periods
    for (const p of this.op.no_touch.restricted_periods || []) {
      if (now > new Date(p.start) && now < new Date(p.end)) {
        return {
          cleared: false,
          reason: `Restricted period: ${p.note || "active"}`,
        };
      }
    }

    const host = normalizeTarget(target);

    // CHECK 2a: No-touch hosts
    if (this.op.no_touch.hosts.some((x) => matchHost(host, x))) {
      return { cleared: false, reason: `${host} is no-touch` };
    }

    // CHECK 2b: No-touch CIDRs
    if (this.op.no_touch.cidrs.some((c) => matchCIDR(host, c))) {
      return { cleared: false, reason: `${host} in no-touch CIDR` };
    }

    // CHECK 2c: Must be inside perimeter
    const inPerimeter =
      this.op.perimeter.hosts.some((x) => matchHost(host, x)) ||
      this.op.perimeter.domains.some((d) => matchDomain(host, d)) ||
      this.op.perimeter.cidrs.some((c) => matchCIDR(host, c));

    return inPerimeter
      ? { cleared: true, reason: "" }
      : { cleared: false, reason: `${host} outside perimeter` };
  }

  /**
   * Check whether a MITRE ATT&CK tactic is permitted by operation constraints.
   * Does NOT consider gate mode — call gateCheck() for that.
   */
  classify(tactic: string): ClassifyResult {
    if (this.op.constraints.blocked_tactics.includes(tactic)) {
      return { allowed: false, reason: `Tactic '${tactic}' is blocked` };
    }
    return { allowed: true, reason: "" };
  }

  /**
   * Determine the gate decision for a tactic given the current operational mode.
   *
   * observer   → always "block"
   * autonomous → always "pass"
   * controlled → always "gate"
   * supervised → "gate" if tactic is in gated_tactics, otherwise "pass"
   */
  gateCheck(tactic: string, mode: GateMode): GateDecision {
    if (mode === "observer") return "block";
    if (mode === "autonomous") return "pass";
    if (mode === "controlled") return "gate";
    // supervised
    return this.op.constraints.gated_tactics.includes(tactic) ? "gate" : "pass";
  }

  /**
   * Non-destructive preview of all authorization checks.
   * Returns a full result object without logging or mutating any state.
   */
  dryRun(target: string, tactic: string, mode: GateMode): DryRunResult {
    const auth = this.authorize(target);
    const classify = this.classify(tactic);
    const gate = this.gateCheck(tactic, mode);

    const cleared =
      auth.cleared &&
      classify.allowed &&
      gate === "pass";

    return { target, tactic, mode, auth, classify, gate, cleared };
  }
}

export default PerimeterGuard;
