const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export interface LocalAuthRequest {
  host?: string | null;
  forwardedHost?: string | null;
  forwardedFor?: string | null;
}

export function normalizeHostname(value: string | null | undefined): string {
  if (!value) return "";

  let host = value.trim().toLowerCase();
  if (!host) return "";

  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    host = end === -1 ? host.slice(1) : host.slice(1, end);
  } else if (/^[^:]+:\d+$/.test(host)) {
    host = host.slice(0, host.lastIndexOf(":"));
  }

  const zoneIndex = host.indexOf("%");
  if (zoneIndex !== -1) {
    host = host.slice(0, zoneIndex);
  }

  return host;
}

export function isLoopbackHost(value: string | null | undefined): boolean {
  return LOOPBACK_HOSTS.has(normalizeHostname(value));
}

function everyAddressIsLoopback(value: string | null | undefined): boolean {
  if (value == null) return true;

  const addresses = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return addresses.length > 0 && addresses.every((address) => isLoopbackHost(address));
}

export function isLoopbackRequest(request?: LocalAuthRequest): boolean {
  const host = request?.host ?? (typeof window !== "undefined" ? window.location.host : null);

  return (
    isLoopbackHost(host) &&
    everyAddressIsLoopback(request?.forwardedHost) &&
    everyAddressIsLoopback(request?.forwardedFor)
  );
}
