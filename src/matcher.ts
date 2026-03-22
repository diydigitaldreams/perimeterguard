/**
 * Host, domain, and wildcard matching utilities.
 * Reconstructed from TRIDENT v4 implementation (March 2026).
 */

/**
 * Escapes special regex characters in a string so it can be used
 * safely inside new RegExp() without injection risk.
 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes a target string to a bare hostname.
 * Strips: http(s):// prefix, path components, port numbers.
 *
 * "https://api.example.com:443/path" → "api.example.com"
 */
export function normalizeTarget(target: string): string {
  return target
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

/**
 * Matches a hostname against an exact or wildcard pattern.
 * Wildcards use "*" as a token that maps to ".*" in regex.
 *
 * "*.example.com" matches "api.example.com"
 * "api.example.com" matches only "api.example.com"
 */
export function matchHost(host: string, pattern: string): boolean {
  if (!pattern.includes("*")) return host === pattern;
  const re = new RegExp(
    "^" +
      pattern
        .split("*")
        .map(escapeRegex)
        .join(".*") +
      "$"
  );
  return re.test(host);
}

/**
 * Matches a hostname against a domain pattern.
 * "*.corp.local" matches any direct subdomain of corp.local.
 * Exact domain match is also supported.
 */
export function matchDomain(host: string, domain: string): boolean {
  if (domain.startsWith("*.")) {
    const base = domain.slice(2); // strip "*."
    return host.endsWith("." + base) || host === base;
  }
  return host === domain;
}
