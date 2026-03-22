/**
 * Bitwise IPv4 CIDR matching.
 * Reconstructed from TRIDENT v4 implementation (March 2026).
 */

/**
 * Returns true if the given host IP falls within the specified CIDR range.
 * Uses proper 32-bit bitwise comparison — not string prefix matching.
 *
 * @param host  - IPv4 address string, e.g. "10.0.200.5"
 * @param cidr  - CIDR notation string, e.g. "10.0.0.0/16"
 */
export function matchCIDR(host: string, cidr: string): boolean {
  const parts = cidr.split("/");
  if (parts.length !== 2) return host === cidr;

  const mask = parseInt(parts[1], 10);
  if (isNaN(mask) || mask < 0 || mask > 32) return false;

  const cidrOctets = parts[0].split(".").map(Number);
  const hostOctets = host.split(".").map(Number);

  if (cidrOctets.length !== 4 || hostOctets.length !== 4) return false;
  if (cidrOctets.some((o) => isNaN(o) || o < 0 || o > 255)) return false;
  if (hostOctets.some((o) => isNaN(o) || o < 0 || o > 255)) return false;

  const cidrInt =
    ((cidrOctets[0] << 24) |
      (cidrOctets[1] << 16) |
      (cidrOctets[2] << 8) |
      cidrOctets[3]) >>>
    0;

  const hostInt =
    ((hostOctets[0] << 24) |
      (hostOctets[1] << 16) |
      (hostOctets[2] << 8) |
      hostOctets[3]) >>>
    0;

  // mask === 0 means match everything (/0)
  const maskInt = mask === 0 ? 0 : (((~0) << (32 - mask)) >>> 0);

  return (cidrInt & maskInt) === (hostInt & maskInt);
}
