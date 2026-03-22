import { PerimeterGuard } from "../src/index";
import { BASE_OP, FUTURE_OP, EXPIRED_OP, RESTRICTED_OP } from "./fixtures";

describe("PerimeterGuard.authorize()", () => {
  const guard = new PerimeterGuard(BASE_OP);

  test("null operation returns cleared:false", () => {
    const g = new PerimeterGuard(null as any);
    expect(g.authorize("api.example.com").cleared).toBe(false);
  });

  test("null target returns cleared:false", () => {
    expect(guard.authorize("").cleared).toBe(false);
    expect(guard.authorize(null as any).cleared).toBe(false);
  });

  test("operation not yet started returns cleared:false", () => {
    const g = new PerimeterGuard(FUTURE_OP);
    const result = g.authorize("api.example.com");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/not yet active/);
  });

  test("operation window closed returns cleared:false", () => {
    const g = new PerimeterGuard(EXPIRED_OP);
    const result = g.authorize("api.example.com");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/window closed/);
  });

  test("active restricted period returns cleared:false", () => {
    const g = new PerimeterGuard(RESTRICTED_OP);
    const result = g.authorize("api.example.com");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/maintenance window/);
  });

  test("no-touch host blocks authorization", () => {
    const result = guard.authorize("prod.example.com");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/no-touch/);
  });

  test("no-touch CIDR blocks authorization", () => {
    // 10.0.1.50 is inside 10.0.1.0/24 which is no-touch
    const result = guard.authorize("10.0.1.50");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/no-touch CIDR/);
  });

  test("exact host in perimeter.hosts returns cleared:true", () => {
    expect(guard.authorize("api.example.com").cleared).toBe(true);
  });

  test("wildcard host in perimeter.hosts returns cleared:true", () => {
    expect(guard.authorize("staging.dev.example.com").cleared).toBe(true);
  });

  test("subdomain matching perimeter.domains wildcard returns cleared:true", () => {
    expect(guard.authorize("server1.corp.local").cleared).toBe(true);
  });

  test("IP inside perimeter CIDR returns cleared:true", () => {
    // 10.0.200.5 is inside 10.0.0.0/16
    expect(guard.authorize("10.0.200.5").cleared).toBe(true);
  });

  test("IP inside /24 perimeter CIDR returns cleared:true", () => {
    expect(guard.authorize("192.168.1.100").cleared).toBe(true);
  });

  test("host outside all perimeter definitions returns cleared:false", () => {
    const result = guard.authorize("attacker.com");
    expect(result.cleared).toBe(false);
    expect(result.reason).toMatch(/outside perimeter/);
  });

  test("strips https:// prefix before matching", () => {
    expect(guard.authorize("https://api.example.com").cleared).toBe(true);
  });

  test("strips port number before matching", () => {
    expect(guard.authorize("api.example.com:8443").cleared).toBe(true);
  });

  test("strips path before matching", () => {
    expect(guard.authorize("api.example.com/v1/users").cleared).toBe(true);
  });
});
