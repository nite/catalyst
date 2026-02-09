---
description: LLM evaluation patterns and libraries.
globs:
  - "**/*.py"
alwaysApply: true
---

# LLM Evaluation Patterns

## LiteLLM for Multi-Provider Support

```python
import litellm
from langfuse.decorators import observe

@observe()
async def call_llm(
    prompt: str,
    model: str = "gpt-4o",
    temperature: float = 0.0,
) -> str:
    """Call LLM with observability."""
    response = await litellm.acompletion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )
    return response.choices[0].message.content
```

## DeepEval Metrics

```python
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    GEval,
)

def create_metrics(metric_names: list[str]) -> list[BaseMetric]:
    """Create DeepEval metrics from names."""
    metric_map = {
        "relevance": AnswerRelevancyMetric(),
        "faithfulness": FaithfulnessMetric(),
        "accuracy": GEval(
            name="Accuracy",
            criteria="Accuracy of the response",
            evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT],
        ),
    }
    return [metric_map[name] for name in metric_names if name in metric_map]
```

## Langfuse Observability

```python
from langfuse import Langfuse

langfuse = Langfuse()

with langfuse.trace(name="evaluation-run") as trace:
    trace.update(metadata={"model": model, "dataset": dataset_id})

    for item in dataset:
        with trace.span(name="evaluate-item") as span:
            result = await evaluate_item(item)
            span.update(output=result)
```
