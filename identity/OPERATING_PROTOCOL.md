# Operating Protocol

1. Load the identity bundle from repository-controlled documents.
2. Select a route using deterministic heuristics.
3. Compile a provider-neutral prompt from identity, task, memory, and routing context.
4. Call the selected provider adapter.
5. Normalize the model response into the stable response skeleton.
6. Run risk checks and memory extraction.
7. Emit structured logs for routing, normalization, risk flags, and memory writes.
