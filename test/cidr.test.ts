import { matchCIDR } from "../src/cidr";

describe("matchCIDR()", () => {
  test("/24 — host inside returns true", () => {
    expect(matchCIDR("192.168.1.50", "192.168.1.0/24")).toBe(true);
  });

  test("/24 — host outside returns false", () => {
    expect(matchCIDR("192.168.2.1", "192.168.1.0/24")).toBe(false);
  });

  test("/16 — cross-subnet match (the string-prefix bug case)", () => {
    // 10.0.200.5 is in 10.0.0.0/16 but NOT a string-prefix match on "10.0.0"
    expect(matchCIDR("10.0.200.5", "10.0.0.0/16")).toBe(true);
  });

  test("/16 — host outside returns false", () => {
    expect(matchCIDR("10.1.0.1", "10.0.0.0/16")).toBe(false);
  });

  test("/32 — exact host match", () => {
    expect(matchCIDR("10.0.0.1", "10.0.0.1/32")).toBe(true);
  });

  test("/32 — different host returns false", () => {
    expect(matchCIDR("10.0.0.2", "10.0.0.1/32")).toBe(false);
  });

  test("/0 — matches any valid IP", () => {
    expect(matchCIDR("8.8.8.8", "0.0.0.0/0")).toBe(true);
    expect(matchCIDR("192.168.99.1", "0.0.0.0/0")).toBe(true);
  });

  test("invalid CIDR format returns false gracefully", () => {
    expect(matchCIDR("10.0.0.1", "not-a-cidr")).toBe(false);
    expect(matchCIDR("10.0.0.1", "10.0.0.0/abc")).toBe(false);
    expect(matchCIDR("10.0.0.1", "10.0.0.0")).toBe(false);
  });

  test("non-IP host returns false gracefully", () => {
    expect(matchCIDR("api.example.com", "10.0.0.0/16")).toBe(false);
  });

  test("mask out of range returns false gracefully", () => {
    expect(matchCIDR("10.0.0.1", "10.0.0.0/33")).toBe(false);
    expect(matchCIDR("10.0.0.1", "10.0.0.0/-1")).toBe(false);
  });
});
