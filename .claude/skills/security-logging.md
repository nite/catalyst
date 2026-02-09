---
description: Logging and data sanitation rules.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Logging and Data Sanitation (CRITICAL)

**NEVER expose PHI, PII, credentials, or sensitive infrastructure details in logs or HTTP responses at any log level.**

| Category | Never Log or Return | Instead Log | Instead Return |
| --- | --- | --- | --- |
| PHI or PII | Patient IDs, names, DOB, MRN | "Processing patient record" | Generic error message |
| Infrastructure | AWS account IDs, ARNs, bucket names | "AWS operation failed" | "Service unavailable" |
| Credentials | API keys, tokens, passwords | "Authentication failed" | "Invalid credentials" |
| Error details | Raw SDK or DB error messages | "Service error" | "Service unavailable" |

## Pattern: Sanitize Logs at All Levels

```python
try:
    result = aws_operation()
    logger.info("AWS operation completed")
except ClientError:
    logger.error("AWS operation failed")
    raise HTTPException(status_code=503, detail="Service temporarily unavailable")
```
