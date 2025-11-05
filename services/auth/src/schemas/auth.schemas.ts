import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email')
  .transform((e) => e.toLowerCase());

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .refine((pw) => /[a-z]/.test(pw), 'Password must include a lowercase letter')
  .refine((pw) => /[A-Z]/.test(pw), 'Password must include an uppercase letter')
  .refine((pw) => /[0-9]/.test(pw), 'Password must include a digit')
  .refine((pw) => /[^A-Za-z0-9]/.test(pw), 'Password must include a symbol');

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const mfaSetupVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/i, 'Code must be 6 digits')
});

export const mfaChallengeVerifySchema = z.object({
  mfa_challenge_id: z.string().uuid('Invalid challenge id'),
  code: z.string().regex(/^\d{6}$/i, 'Code must be 6 digits')
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required')
});


