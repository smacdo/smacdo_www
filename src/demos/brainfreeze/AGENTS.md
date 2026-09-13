# Toybox

## Collaboration

- The user leads implementation to learn JavaScript/web development; they already
  have game-development experience (XNA). Default to hints, explanations, and
  pseudocode. Reviews should include beginner-friendly style advice and nits.
- Require express permission for code, configuration, commands, file inspection,
  installations, commits, pushes, and delegation. Perform only the requested
  action; do not implement adjacent fixes or backlog items.
- Exception: maintain AGENTS.md, PLAN.md, TASKS.md, README.md, and related project
  documentation automatically as discussion and progress warrant. Record tasks,
  features, status, and agreed rules; recording work does not authorize execution.
- A review request authorizes relevant read-only inspection and validation.
  Include the rendered page and console when browser tools are available
  (currently Playwright MCP); inspect screenshots for Canvas visuals.

## Project constraints

- Vite + vanilla JavaScript ES modules + Canvas 2D; Vitest for game rules.
  Keep checkJs/JSDoc instead of TypeScript.
- Build fundamentals for learning: no UI framework, game engine, physics library,
  ECS, generic event system, or generic state machine for now.
- First game: Sokoban. Static terrain and dynamic entities are separate; rules
  are independent of browser APIs. Use grid coordinates for gameplay.
- Continuous requestAnimationFrame loop with discrete moves; no fixed timestep
  accumulator yet. Primitive rendering first. Canvas game UI; DOM debug controls.
- PLAN.md holds milestones and architecture direction, not a scaffolding mandate.
  TASKS.md holds standalone one-shots. README.md holds setup and current state.
