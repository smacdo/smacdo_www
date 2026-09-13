# Project plan

This is a learning roadmap, not authorization for an assistant to implement work.
Milestones describe outcomes; implement them in small, user-led steps.
The assistant may keep this roadmap and milestone status current as discussion
and development progress, without asking separately for documentation edits.

## Goal

Build a small complete Sokoban game, then try a different prototype to test which
fundamentals deserve to become reusable core code.

## Pause and handoff — 2026-09-13

Game development is paused while the user waits for usage to reset. Next intended
work is grafting Toybox into the user's other Git project, `smacdo_www`. No target
repository inspection, migration, or Git operation has started. Resume by agreeing
on the target location, integration approach, and whether/how to preserve history;
inspect its stack and instructions when authorized. Carry over the learning-first
workflow, game progress, and backlog. Do not assume deployment or history rewriting
is authorized. Unit tests were the suggested next game task, now deferred behind
this pivot.

Latest review: lint, formatting, and build passed; browser checks exercised undo.
Restart now clears undo history in source, and the user reports the fix works;
that final fix has not been independently rerun. No persistent unit tests exist yet.

## Milestones

### 0. Browser rendering — complete

- Vite serves the project.
- HTML defines a 640 × 480 canvas.
- JavaScript obtains its 2D context and fills a rectangle.
- The rendered output has been checked in a browser without console warnings or
  errors. The latest reviewed rectangle was pink.

### 1. One visible level with player movement — complete

Implemented and reviewed: frame loop, delta time, held/pressed keyboard input,
hardcoded level, tile/entity rendering, and grid movement with wall/bounds checks.
Rendering remains in Game; a separate Renderer is deferred. The board's bottom
row is still partly clipped by the canvas (TASKS.md).

Suggested learning sequence:

1. Introduce a requestAnimationFrame loop with update and render steps. Compute
   elapsed time in seconds and clamp unusually large deltas after tab switching.
2. Track keyboard keys currently down and pressed this frame. Clear transient
   presses after they have been consumed; handle focus loss to avoid stuck keys.
3. Hardcode one level as JavaScript data: static terrain and separate entity positions.
4. Draw terrain and entities as primitive shapes through a thin renderer.
5. Translate input into discrete movement; prevent movement into walls or outside
   the board. Decide when moves repeat instead of letting render rate dictate it.

Done when one level appears and the player can move legally on its grid.
Introduce modules as each step needs them, not all at once.

### 2. Complete the single-level rules — gameplay implemented; tests pending

Crate pushing, goal highlighting, completion banner, R to restart, and Z to undo
are implemented. Snapshot history covers successful moves only. Core behavior has
been manually and programmatically checked; permanent Vitest coverage is pending.

- Crate pushing, including blocked pushes and no pushing multiple crates at once.
- Completion detection when all crates occupy goals.
- Restart and snapshot-based undo. Record player/crate positions before successful
  moves only; static terrain is not part of history.
- Vitest coverage for valid/invalid moves, pushes, undo, restart, and completion.

Done when the level can be solved, restarted, and undone without browser-dependent
game rules.

### 3. Complete the Sokoban MVP

- Multiple hardcoded JavaScript levels and progression through a small LevelManager.
- Simple title, gameplay, and level-complete flow.
- Lightweight SceneManager with replace(); add push()/pop() only if needed.
- Small debug overlay: start with useful values such as frame time, player tile
  position, canvas dimensions, and tile size. Add grid/coordinate toggles as useful.
- Primitive rendering remains sufficient.

Done when a player can start, play through multiple levels, undo/restart, and reach
an understandable completion state.

## Architecture direction

These are candidate responsibilities, not required classes to create immediately.

| Area         | Responsibility                                            |
| ------------ | --------------------------------------------------------- |
| Game         | Browser loop and overall lifecycle                        |
| Input        | Browser events and input state; mouse support when needed |
| Renderer     | Canvas drawing; later scaling and coordinate conversion   |
| SceneManager | Active scene lifecycle and replacement                    |
| GameScene    | Translate input into Sokoban actions and render its state |
| SokobanGame  | Pure game rules and live dynamic state                    |
| TileMap      | Static terrain queries and bounds                         |
| LevelManager | Level selection and progression, not live gameplay state  |
| DebugOverlay | Small, useful development readouts                        |

Scenes may expose enter(), exit(), update(dt), and render(renderer); no base class
is required. Player/crate data can remain plain objects until behavior justifies
classes.

MVP levels are hardcoded JavaScript data, not text to parse. Keep level definitions
separate from mutable gameplay state so restart can reuse the initial positions.
A post-MVP parser can produce the same data shape without changing game rules.
Use equal, nonzero box and goal counts for MVP. Checking that every goal has a box
is equivalent to checking every box is on a goal under those level invariants.
Level validation is still pending; unequal counts are future explicit variants.

Keep logical game coordinates distinct from CSS display size and canvas bitmap
size. For now they can match. Let Renderer own future resolution and DPI handling.

## After MVP

- Consider movement animation and optional restart confirmation (existing code
  TODOs, not required for the current prototype). A fixed timestep accumulator
  remains deferred despite its code TODO; reachability analysis is also a stretch.
- Text level parsing via a plain parseLevel(text) function. Choose the symbol legend
  and handle entities on goals, whitespace, and invalid input then.
- Sprite sheets and a small asset loader.
- Web Audio wrapper, potentially brought forward if desired.
- Small Canvas buttons when needed; no generic UI framework.
- Richer debug tools and resolution/aspect-ratio experiments.
- Later: localStorage persistence, level select, configurable rendering, and camera
  behavior if a prototype needs it.
- Evaluate the reusable core after prototype two before generalizing it further.

Reconsider a rendering library such as PixiJS only if rendering plumbing starts
outweighing the learning benefit. No engine or additional runtime library is
planned now.
