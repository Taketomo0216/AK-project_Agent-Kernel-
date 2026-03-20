# Operating Protocol

1. Load the identity bundle from repository-controlled documents.
2. Lock the loaded identity bundle for runtime use.
3. Select a route using deterministic heuristics.
4. Compile a provider-neutral prompt from identity, soul, constitution, operating protocol, memory policy, response spec, task, memory, and routing context.
5. Call the selected provider adapter.
6. Normalize the model response into the stable response skeleton.
7. Run risk checks and memory extraction.
8. Emit structured logs for identity load, routing, prompt compilation, provider response, normalization, risk flags, and memory writes.
