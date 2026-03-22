import { PerimeterGuard } from "../src/index";
import { BASE_OP } from "./fixtures";

describe("PerimeterGuard.gateCheck()", () => {
  const guard = new PerimeterGuard(BASE_OP);
  const gatedTactic = "TA0002";
  const freeTactic = "TA0043";

  test("observer mode always returns 'block'", () => {
    expect(guard.gateCheck(gatedTactic, "observer")).toBe("block");
    expect(guard.gateCheck(freeTactic, "observer")).toBe("block");
  });

  test("autonomous mode always returns 'pass'", () => {
    expect(guard.gateCheck(gatedTactic, "autonomous")).toBe("pass");
    expect(guard.gateCheck(freeTactic, "autonomous")).toBe("pass");
  });

  test("controlled mode always returns 'gate'", () => {
    expect(guard.gateCheck(gatedTactic, "controlled")).toBe("gate");
    expect(guard.gateCheck(freeTactic, "controlled")).toBe("gate");
  });

  test("supervised + gated tactic returns 'gate'", () => {
    expect(guard.gateCheck(gatedTactic, "supervised")).toBe("gate");
  });

  test("supervised + second gated tactic returns 'gate'", () => {
    expect(guard.gateCheck("TA0008", "supervised")).toBe("gate");
  });

  test("supervised + non-gated tactic returns 'pass'", () => {
    expect(guard.gateCheck(freeTactic, "supervised")).toBe("pass");
  });
});
