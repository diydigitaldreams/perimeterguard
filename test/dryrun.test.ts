import { PerimeterGuard } from "../src/index";
import { BASE_OP } from "./fixtures";

describe("PerimeterGuard.dryRun()", () => {
  const guard = new PerimeterGuard(BASE_OP);

  test("all fields present in result", () => {
    const result = guard.dryRun("api.example.com", "TA0043", "supervised");
    expect(result).toHaveProperty("target");
    expect(result).toHaveProperty("tactic");
    expect(result).toHaveProperty("mode");
    expect(result).toHaveProperty("auth");
    expect(result).toHaveProperty("classify");
    expect(result).toHaveProperty("gate");
    expect(result).toHaveProperty("cleared");
  });

  test("cleared:true when all checks pass", () => {
    const result = guard.dryRun("api.example.com", "TA0043", "supervised");
    expect(result.cleared).toBe(true);
    expect(result.auth.cleared).toBe(true);
    expect(result.classify.allowed).toBe(true);
    expect(result.gate).toBe("pass");
  });

  test("cleared:false when target is outside perimeter", () => {
    const result = guard.dryRun("evil.com", "TA0043", "supervised");
    expect(result.cleared).toBe(false);
    expect(result.auth.cleared).toBe(false);
  });

  test("cleared:false when tactic is blocked", () => {
    const result = guard.dryRun("api.example.com", "TA0040", "supervised");
    expect(result.cleared).toBe(false);
    expect(result.classify.allowed).toBe(false);
  });

  test("cleared:false when gate returns block (observer mode)", () => {
    const result = guard.dryRun("api.example.com", "TA0043", "observer");
    expect(result.cleared).toBe(false);
    expect(result.gate).toBe("block");
  });

  test("cleared:false when gate returns gate (requires approval)", () => {
    // gated tactic in supervised mode → gate, not pass → not cleared
    const result = guard.dryRun("api.example.com", "TA0002", "supervised");
    expect(result.cleared).toBe(false);
    expect(result.gate).toBe("gate");
  });

  test("non-destructive — calling dryRun does not mutate op config", () => {
    const before = JSON.stringify(BASE_OP);
    guard.dryRun("api.example.com", "TA0043", "supervised");
    expect(JSON.stringify(BASE_OP)).toBe(before);
  });

  test("result echoes back the input target, tactic, and mode", () => {
    const result = guard.dryRun("10.0.200.5", "TA0008", "controlled");
    expect(result.target).toBe("10.0.200.5");
    expect(result.tactic).toBe("TA0008");
    expect(result.mode).toBe("controlled");
  });
});
