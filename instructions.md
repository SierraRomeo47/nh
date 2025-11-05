# Nautilus Horizon v1.3 — Problem Statement, Goals, and Phase 2 Scope

## Problem Statement
Shipping operators, verifiers, and trading desks require a unified platform to manage emissions data, compliance reporting, and environmental allowance trading with auditable integrity and regulatory alignment.

## Goals (v1.3 Pilot)
- Provide secure, modular services for authentication, vessels, voyages, compliance, and trading.
- Enforce plan-first changes and TDD to ensure correctness and maintainability.
- Standardize error shape `{ code  message  traceId }` and traceability across services.
- Protect user data: no PII in logs, mask tokens, TLS 1.3, AES-256 at rest.
- Route cross-service communication through the nginx gateway only.

## Phase 2 Scope
- Auth
- Audit
- Compliance ledger
- EUA (European Union Allowance) ticker
- Pooling RFQ (request for quote) sandbox
- MRV (monitoring, reporting, and verification) import
- Verifier export
- Registry mirror
- KPIs

## Engineering Approach
- Layering: controller -> service -> repository -> database; no controller -> repository direct access.
- No service imports another service; cross-service calls over HTTP at the gateway.
- Per-service models/DTOs; no shared mutable state (schemas for contracts only).
- Single outbound HTTP client with retries, timeouts, and traceId propagation.
- TDD: write tests first -> minimal code -> run tests -> fix until green.


