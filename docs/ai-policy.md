# AI code governance
Purpose: keep AI assisted code safe and auditable.

**Human in the loop**  
Every pull request gets human review.

**Required checks**  
Static application security testing (SAST)  
Unit tests and integration tests must pass in continuous integration (CI)  
Secrets scan and dependency scan

**Data handling**  
Do not paste production secrets  
Mask personally identifiable information (PII)  
Follow least privilege for role based access control (RBAC) and attribute based access control (ABAC)

**Auth and crypto**  
Use JSON web token (JWT) with refresh  
Use transport layer security (TLS) 1.3 and advanced encryption standard (AES) 256 at rest  
Do not design new cryptography

**Logging and audit**  
Record sign in  data edits  permission decisions with trace id  
Keep logs immutable for audit










