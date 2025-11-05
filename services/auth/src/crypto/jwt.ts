import { SignJWT, jwtVerify, generateKeyPair } from 'jose';

let keypairPromise: Promise<CryptoKeyPair> | null = null;

async function getKeys() {
  if (!keypairPromise) {
    keypairPromise = generateKeyPair('RS256');
  }
  return keypairPromise;
}

export async function signAccessToken(claims: { sub: string; roles: string[]; mfa?: boolean }, opts: { ttlSeconds: number }) {
  const { privateKey } = await getKeys();
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ roles: claims.roles, mfa: !!claims.mfa })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + opts.ttlSeconds)
    .setJti(`${now}-${Math.random().toString(36).slice(2)}`)
    .sign(privateKey);
  return jwt;
}

export async function verifyAccessToken(token: string) {
  const { publicKey } = await getKeys();
  const { payload } = await jwtVerify(token, publicKey, { algorithms: ['RS256'] });
  // normalize types
  return {
    sub: String(payload.sub),
    roles: (payload as any).roles as string[],
    mfa: Boolean((payload as any).mfa),
    iat: Number(payload.iat),
    exp: Number(payload.exp)
  };
}
