import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 32)) as Buffer;
  return `s2$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [prefix, saltHex, hashHex] = hash.split('$');
  if (!prefix || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const derived = (await scrypt(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hashHex, 'hex');
  return timingSafeEqual(derived, expected);
}
