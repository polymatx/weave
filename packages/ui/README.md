# @polymatx/weave-ui

Local trace UI for `weave`. Reads the SQLite file your runs write to and serves a small dashboard.

```bash
npx @polymatx/weave-ui --db ./weave.sqlite --port 4321
# open http://localhost:4321
```

Shows runs list, per-run event timeline, tokens, cost, errors.
