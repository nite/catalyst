---
description: FastAPI, Pydantic, and backend logging rules.
globs:
  - "**/*.py"
alwaysApply: true
---

# FastAPI and Python

## Use Established Libraries

| Library | Use For |
| --- | --- |
| pydantic | Data validation, settings |
| httpx | Async HTTP requests |
| tenacity | Retry logic with backoff |
| litellm | Multi-provider LLM calls |
| langfuse | LLM observability |
| deepeval | Evaluation metrics |
| loguru | Structured logging |

## Pydantic Models

```python
class EvaluationRequest(BaseModel):
    """Request model for running an evaluation."""

    dataset_id: str = Field(..., description="Dataset to evaluate")
    model: str = Field(default="gpt-4o", description="LLM model to use")
    metrics: list[str] = Field(default_factory=list, description="Metrics to compute")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "dataset_id": "ds_123",
                "model": "gpt-4o",
                "metrics": ["accuracy", "faithfulness"],
            }
        }
    )
```

## Router Organization

```python
router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

@router.post("/", response_model=EvaluationResponse)
async def create_evaluation(
    request: EvaluationRequest,
) -> EvaluationResponse:
    """Create and run a new evaluation."""
    logger.info(
        "POST /evaluations dataset={} model={}",
        request.dataset_id,
        request.model,
    )
    start_time = time.perf_counter()

    try:
        result = await evaluation_service.run(request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.success("Evaluation complete in {:.2f}ms", elapsed_ms)
        return result
    except Exception:
        logger.exception("Evaluation failed")
        raise HTTPException(status_code=500, detail="Evaluation failed")
```

## Logging (CRITICAL)

**Use loguru for backend. Never use console.log or print for logging.**

- Use {} formatting style, not printf.
- Use logger.exception() inside except blocks.
- NEVER log PHI, PII, credentials, ARNs, bucket names, S3 keys, or DB details.
- Sanitize ALL logs and HTTP error responses at every level.

```python
from loguru import logger

logger.info("Processing item {}/{}", i, total)
logger.success("Completed in {:.2f}ms", elapsed_ms)
logger.exception("Failed to process request")
```
