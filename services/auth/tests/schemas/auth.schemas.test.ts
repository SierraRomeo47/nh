import { describe, it, expect } from 'vitest';
import { registerRequestSchema, loginRequestSchema } from '../../src/schemas/auth.schemas';

describe('Zod schemas', () => {
  it('register schema validates and normalizes email, enforces password policy', () => {
    const valid = registerRequestSchema.parse({
      email: 'User@Example.com',
      password: 'ValidPassword!123'
    });
    expect(valid.email).toBe('user@example.com');

    expect(() => registerRequestSchema.parse({ email: 'bad', password: 'ValidPassword!123' })).toThrow();
    expect(() => registerRequestSchema.parse({ email: 'a@b.com', password: 'short' })).toThrow();
    expect(() => registerRequestSchema.parse({ email: 'a@b.com', password: 'alllowercase12!' })).toThrow();
    expect(() => registerRequestSchema.parse({ email: 'a@b.com', password: 'ALLUPPERCASE12!' })).toThrow();
    expect(() => registerRequestSchema.parse({ email: 'a@b.com', password: 'NoDigits!!!!' })).toThrow();
    expect(() => registerRequestSchema.parse({ email: 'a@b.com', password: 'NoSymbols1234' })).toThrow();
  });

  it('login schema requires email and password and normalizes email', () => {
    const valid = loginRequestSchema.parse({ email: 'USER@EXAMPLE.COM', password: 'x' });
    expect(valid.email).toBe('user@example.com');
    expect(() => loginRequestSchema.parse({ email: '', password: 'x' })).toThrow();
    expect(() => loginRequestSchema.parse({ email: 'not-an-email', password: 'x' })).toThrow();
    expect(() => loginRequestSchema.parse({ email: 'user@example.com', password: '' })).toThrow();
  });
});


