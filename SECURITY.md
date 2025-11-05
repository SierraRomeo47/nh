# Security Policy

## Human Review and Change Control
- All significant changes require human review before merge.
- Limit autonomous agent self-edit loops to 3. After 3 edits without approval, pause and request human review.

## Testing and Scanning Requirements
- Tests are required for all changes. Use TDD where feasible.
- Security scanning must run in CI:
  - SAST (Static Application Security Testing)
  - SCA (Software Composition Analysis)
- Fix or triage issues before merge.

## Additional Guardrails
- Do not commit secrets. Use environment variables or a secrets manager.
- Enforce TLS 1.3 in production; AES-256 at rest where offered.
- Mask tokens and credentials in logs. Do not log PII.
- Standard error shape: `{ code  message  traceId }`.
