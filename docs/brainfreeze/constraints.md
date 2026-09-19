# Brainfreeze project constraints

Design constraints for the Brainfreeze demo (`src/demos/brainfreeze/`), carried over from the
`toybox` project it was grafted from. These are deliberate learning constraints, not incidental
limitations — check here before proposing a library or an abstraction.

Collaboration and authorization rules are **not** here: the root [AGENTS.md](../../AGENTS.md)
governs those for the whole repository. Toybox's own collaboration section was dropped during the
migration in favor of it.

## Constraints

- **Build fundamentals by hand.** No UI framework, game engine, physics library, ECS, generic
  event system, or generic state machine for now. The point is to understand the parts, then
  decide which ones deserve to become reusable.
- **TypeScript ES modules + Canvas 2D**, bundled by esbuild alongside the rest of the site. See
  [MIGRATION.md](MIGRATION.md) for the original integration decision and conversion context.
- **Game rules stay independent of browser APIs.** `sokoban-game.ts` owns movement, pushing,
  undo, restart, and completion without touching the DOM, Canvas, or input events.
- **Static terrain and dynamic entities stay separate**, and gameplay uses grid coordinates.
  Level definitions stay separate from mutable state so restart can reuse initial positions.
- **Continuous `requestAnimationFrame` loop with discrete moves.** No fixed-timestep accumulator
  yet, despite the TODO in `game.ts`. Primitive rendering first.
- **Canvas for game UI; DOM for debug controls** if and when debug controls appear.
- Reconsider a rendering library such as PixiJS only if rendering plumbing starts outweighing the
  learning benefit.

## Companion documents

- [MIGRATION.md](MIGRATION.md) — the graft into this repository: phases, decisions, findings.
- [PLAN.md](PLAN.md) — milestones and architecture direction, not a scaffolding mandate.
- [TASKS.md](TASKS.md) — standalone one-shot tasks.
- [README.md](README.md) — setup and current state.
