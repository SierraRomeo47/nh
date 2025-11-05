import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/crypto/bcrypt';

describe('bcrypt utils', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('Secret!1234');
    expect(typeof hash).toBe('string');
    const ok = await verifyPassword('Secret!1234', hash);
    expect(ok).toBe(true);
    const bad = await verifyPassword('wrong', hash);
    expect(bad).toBe(false);
  });
});
