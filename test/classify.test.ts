import { PerimeterGuard } from "../src/index";
import { BASE_OP } from "./fixtures";

describe("PerimeterGuard.classify()", () => {
  const guard = new PerimeterGuard(BASE_OP);

  test("blocked tactic returns allowed:false with reason", () => {
    const result = guard.classify("TA0040");
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/TA0040/);
  });

  test("second blocked tactic also returns allowed:false", () => {
    const result = guard.classify("TA0010");
    expect(result.allowed).toBe(false);
  });

  test("gated tactic (not blocked) returns allowed:true", () => {
    // TA0002 is gated but not blocked — classify only checks blocked
    const result = guard.classify("TA0002");
    expect(result.allowed).toBe(true);
  });

  test("non-blocked, non-gated tactic returns allowed:true", () => {
    const result = guard.classify("TA0043"); // not in any list
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("");
  });
});
