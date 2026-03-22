# PerimeterGuard

![MIT License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Zero-dependency scope enforcement library for security assessment tooling.

PerimeterGuard answers one question: **is this action authorized?**

---

## Install

```bash
npm install perimeterguard
```

---

## Quick Start

```typescript
import { PerimeterGuard } from "perimeterguard";

const guard = new PerimeterGuard({
  operation: {
    name: "Acme Corp External Assessment",
    start: "2026-03-01T00:00:00Z",
    end: "2026-03-31T23:59:59Z",
  },
  perimeter: {
    hosts: ["api.acme.com", "*.dev.acme.com"],
    domains: ["*.acme.internal"],
    cidrs: ["10.10.0.0/16"],
  },
  no_touch: {
    hosts: ["prod.acme.com"],
    cidrs: ["10.10.1.0/24"],
    restricted_periods: [],
  },
  constraints: {
    blocked_tactics: ["TA0040", "TA0010"],
    gated_tactics: ["TA0002", "TA0008"],
  },
});

// Check if a target is authorized
const result = guard.authorize("api.acme.com");
// → { cleared: true, reason: "" }

const blocked = guard.authorize("prod.acme.com");
// → { cleared: false, reason: "prod.acme.com is no-touch" }

// Preview all checks without side effects
const preview = guard.dryRun("10.10.5.22", "TA0002", "supervised");
// → { cleared: false, gate: "gate", ... }  (requires approval)
```

---

## API

| Method | Signature | Returns | Description |
|---|---|---|---|
| `authorize` | `(target: string)` | `AuthResult` | 3-check perimeter + time window authorization |
| `classify` | `(tactic: string)` | `ClassifyResult` | Tactic constraint check (blocked list) |
| `gateCheck` | `(tactic: string, mode: GateMode)` | `GateDecision` | Gate mode decision for a tactic |
| `dryRun` | `(target, tactic, mode)` | `DryRunResult` | Non-destructive preview of all checks |

---

## OperationConfig Schema

```typescript
{
  operation: {
    name: string;        // engagement name
    start?: string;      // ISO date — operation not active before this
    end?: string;        // ISO date — operation not active after this
  };
  perimeter: {
    hosts: string[];     // "api.example.com" or "*.example.com"
    domains: string[];   // "*.corp.local"
    cidrs: string[];     // "10.0.0.0/16"
  };
  no_touch: {
    hosts: string[];     // always blocked, checked before perimeter
    cidrs: string[];     // always blocked
    restricted_periods: Array<{
      start: string;     // ISO date
      end: string;       // ISO date
      note?: string;     // human-readable reason
    }>;
  };
  constraints: {
    blocked_tactics: string[];  // MITRE ATT&CK tactic IDs — always denied
    gated_tactics: string[];    // require gate approval in supervised mode
  };
}
```

---

## Gate Mode Behavior

| Mode | Recon | Exploitation | Impact | Use Case |
|---|---|---|---|---|
| `observer` | BLOCK | BLOCK | BLOCK | Read-only / documentation |
| `supervised` | PASS | GATE | BLOCK | Default safe mode |
| `controlled` | GATE | GATE | BLOCK | High-scrutiny operations |
| `autonomous` | PASS | PASS | PASS | Automated pipelines |

`blocked_tactics` always block regardless of mode. Mode only affects `gated_tactics`.

---

## Matching Rules

**Hosts:** Exact (`api.example.com`) or wildcard (`*.example.com`). Multi-wildcard supported.

**Domains:** `*.corp.local` matches any direct subdomain. Exact match also supported.

**CIDRs:** Bitwise IPv4 subnet comparison. `10.0.0.0/16` correctly matches `10.0.200.5`.

**Target normalization:** `https://api.example.com:443/path` → `api.example.com` before any matching.

---

## Used By

**[TRIDENT](https://github.com/jp-serrano/trident)** — Red team assessment documentation platform. TRIDENT uses PerimeterGuard to enforce authorized scope boundaries on every logged evidence record.

---

## License

MIT © 2026 Jean Paul Serrano Melendez
