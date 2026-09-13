# Standalone tasks

Independent, small tasks to consider when the user chooses. Larger features and
their steps belong in PLAN.md. The assistant may add tasks and update their status
as discussion and development progress without separate permission. A checkbox
is not permission to execute the task. Move work into PLAN.md if it grows into
a feature.

## Development setup

- [ ] Configure ESLint for browser JavaScript and add a lint command. Confirm it
  works with the existing JavaScript type checking.
- [ ] Configure Prettier and add format/check commands, keeping the current
  double-quote and semicolon style unless the user chooses otherwise.
- [ ] Add Vitest run/watch commands when preparing for game-rule tests; avoid
  creating placeholder tests just to exercise the runner.
- [ ] Simplify .gitignore. Remove unrelated Vite-repository patterns and duplicates;
  reconcile `.vscode/*` plus the extensions.json exception with the later rule
  that ignores the whole `.vscode` directory. Preserve intended generated-file
  exclusions, including `.playwright-mcp/`.

## Starter cleanup

- [ ] Remove unused Vite demo files after checking references: counter.js, starter
  images/logos, and public icons. Review the favicon reference before deleting it.

## Completed

- [x] Connect Playwright MCP and verify the rendered canvas and browser console.
  This is local assistant setup, not a reproducible repository installation.
