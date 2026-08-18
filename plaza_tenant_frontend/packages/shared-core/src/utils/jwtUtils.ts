export interface IJwtPayload {
  sub?: string;
  userId?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Safely decodes a JWT Payload without using raw eval() or atob() vulnerabilities.
 * Handles UTF-8 characters and malformed JSON safely.
 */
export function safeDecodeJwt(token: string): IJwtPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[JWT Safety] Failed to decode JWT payload safely:', e);
    return null;
  }
}

/**
 * Checks if a JWT token is expiring within bufferSeconds (default 60 seconds).
 */
export function isTokenExpiringSoon(token: string | null, bufferSeconds = 60): boolean {
  const payload = safeDecodeJwt(token || '');
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp - currentTime < bufferSeconds;
}
