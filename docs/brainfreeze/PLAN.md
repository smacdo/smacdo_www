# Project plan

This is a learning roadmap, not authorization for an assistant to implement work.
Milestones describe outcomes; implement them in small, user-led steps.
The assistant may keep this roadmap and milestone status current as discussion
and development progress, without asking separately for documentation edits.

## Goal

Build Brainfreeze, a small complete Sokoban-style puzzle game, then try a different
prototype to test which
fundamentals deserve to become reusable core code.

## Migrated into smacdo_www — 2026-09-13

The graft is complete. Toybox now lives in this repository as the Brainfreeze demo, published at
`/games/brainfreeze/`, with all 15 of its original commits preserved and its paths rewritten under
`src/demos/brainfreeze/`. The standalone `toybox` repository is untouched and remains the original.

Settled during migration: the name (Brainfreeze, since Sokoban is a trademark and an own name
suits the site better), the location, history preservation via `git filter-repo`, a single
reformatting commit to this repo's Prettier style, and docs living here in `docs/brainfreeze/`.
Build, typecheck, lint, and formatting are wired up and passing. Full record, including verified
findings worth not re-deriving: [MIGRATION.md](MIGRATION.md).

The TypeScript refactor is complete: all Brainfreeze source modules are TypeScript, and the rules
and browser-facing boundaries have permanent Vitest coverage. Folding this into the site's own
`src/lib/gamebox/` engine is no longer blocked by a possible engine removal — that plan is dropped
— but still waits on a decision about what shape gamebox should take. See
[MIGRATION.md](MIGRATION.md).

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

### 2. Complete the single-level rules — complete

Crate pushing, goal highlighting, completion banner, R to restart, and Z to undo
are implemented. Snapshot history covers successful moves only. Core behavior has
permanent Vitest coverage for movement, pushing, completion, undo, and restart.

- Crate pushing, including blocked pushes and no pushing multiple crates at once.
- Completion detection when all crates occupy goals.
- Restart and snapshot-based undo. Record player/crate positions before successful
  moves only; static terrain is not part of history.
- Vitest coverage for valid/invalid moves, pushes, undo, restart, and completion — complete.

Done when the level can be solved, restarted, and undone without browser-dependent
game rules.

### 3. Complete the Brainfreeze MVP

- Multiple hardcoded TypeScript levels and progression through a small `LevelPack` — complete
  2026-09-20, with three levels and focused progression tests.
- Simple title, gameplay, and level-complete flow. The level-complete prompt and final completion
  state are implemented; the title remains.
- Lightweight SceneManager with replace(); add push()/pop() only if needed.
- Small debug overlay: start with useful values such as frame time, player tile
  position, canvas dimensions, and tile size. Add grid/coordinate toggles as useful.
- Primitive rendering remains sufficient.

Done when a player can start, play through multiple levels, undo/restart, and reach
an understandable completion state.

#### Planned scene and modal sequence

Treat scenes and gameplay modals as related but distinct state. A scene replaces the primary
screen; a modal renders over the gameplay scene and temporarily captures its input. Implement them
as adjacent checkpoints so the current playable behavior remains easy to verify:

1. Add a minimal scene contract and `SceneManager.replace()`, then extract the current gameplay
   into `GameScene` without changing behavior. `Game` keeps the animation loop, input frame cleanup,
   Canvas context, and active scene manager. `GameScene` owns the `LevelPack`, active `SokobanGame`,
   gameplay input mapping, and gameplay rendering.
2. Give `GameScene` one optional, game-specific modal state. Start with a discriminated union for
   level completion and pack completion; add restart confirmation when that feature is implemented.
   When a modal exists, route its permitted actions before gameplay input and render it after the
   board. Enter advances from level completion, while undo and restart remain available and ordinary
   movement stays blocked.
3. Add `TitleScene` and use scene replacement to enter gameplay. Decide later whether pack
   completion remains a gameplay modal or becomes a separate results scene once the desired final
   flow is clearer.

Keep the first modal implementation deliberately narrow: one nullable modal, no modal stack, no
base class, and no generic state-machine or UI framework. Extract shared panel drawing only when a
second modal demonstrates the common layout. Preserve the existing scene and input behavior with
focused transition, input-routing, and rendering tests at each checkpoint.

## Architecture direction

These are candidate responsibilities, not required classes to create immediately.

| Area         | Responsibility                                            |
| ------------ | --------------------------------------------------------- |
| Game         | Browser loop and overall lifecycle                        |
| Input        | Browser events and input state; mouse support when needed |
| Renderer     | Canvas drawing, viewport fitting, DPI, and coordinates    |
| SceneManager | Active scene lifecycle and replacement                    |
| GameScene    | Translate input into Sokoban actions and render its state |
| GameModal    | Explicit overlay state owned and routed by `GameScene`    |
| SokobanGame  | Pure game rules and live dynamic state                    |
| TileMap      | Static terrain queries and bounds                         |
| LevelPack    | Level selection and progression, not live gameplay state  |
| DebugOverlay | Small, useful development readouts                        |
| GameUI       | Minimal Canvas HUD, menus, and reusable buttons as needed |

Scenes may expose enter(), exit(), update(dt), and render(renderer); no base class
is required. Player and crate data remain plain state until behavior justifies classes. Store
player coordinates directly on the live game state and crate/goal coordinates directly on their
records. Do not introduce nested `Position` or `Vector` wrappers solely to group `x` and `y`.

MVP levels are hardcoded TypeScript data, not text to parse. Keep level definitions
separate from mutable gameplay state so restart can reuse the initial positions.
A post-MVP parser can produce the same data shape without changing game rules.
Use equal, nonzero box and goal counts for MVP. Checking that every goal has a box
is equivalent to checking every box is on a goal under those level invariants.
Level validation covers structure, entity placement, and wall-based reachability; unequal counts
remain future explicit variants.

Keep logical game coordinates distinct from CSS display size and canvas bitmap
size. For now they can match. Let Renderer own future resolution and DPI handling. Future level
packs may vary board dimensions substantially, so fitting must derive from each level rather than
assuming the current 8 x 8 board.

## After MVP

- Consider movement animation and optional restart confirmation (existing code
  TODOs, not required for the current prototype). A fixed timestep accumulator
  remains deferred despite its code TODO.
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

## Longer-term direction

These are agreed product directions, not a committed implementation sequence. Prefer small
checkpoints that preserve a playable game.

### Mobile, input, and display

- Support portrait and landscape layouts, viewport changes without losing game state, and an
  explicit fullscreen mode.
- Put device-specific input behind game actions so keyboard, on-screen controls, swipes, and
  controllers drive the same gameplay commands.
- Start mobile input with simple on-screen directional and action controls; swipes can follow as
  an optional second input method.
- Fit variable-sized boards without scrolling when practical, and support zoom plus panning when
  the player wants a closer view or the fitted board is too small to read comfortably. Prefer the
  largest integer pixel-art scale that fits while it remains above a usable minimum tile size.
- Determine the minimum readable displayed tile size experimentally with representative sprite
  art and real phone and desktop viewports. Compare at least 16 x 16 and 32 x 32 CSS pixels per
  tile; 8 x 8 is expected to be useful only as an overview, if at all.
- Keep fractional nearest-neighbor scaling as an optional fallback or experiment. Do not assume
  quarter-step factors such as 1.25 or 1.5 are visually superior without testing representative
  sprite art on real displays.
- Treat logical resolution, CSS display size, canvas bitmap size, and device-pixel ratio as
  distinct values owned by the renderer.

### Game UI

- Move toward a small Canvas-rendered UI for the HUD, menus, level selection, and controls. Derive
  only the reusable layout, focus, and button behavior that real screens require.
- Plain HTML controls are an acceptable bridge while mobile input and responsive layout are being
  established; replacing them with Canvas UI is not an MVP prerequisite.
- Advanced Canvas text, screen-reader integration, and full accessibility work are deferred for
  this small game. Preserve keyboard play, legible contrast, and adequately sized controls where
  those come cheaply, and avoid designs that make later improvements impossible.
- Planned HUD information includes pack name, level number or name, move count, push count, undo,
  redo, and menu access. A timer remains optional until its pause and scoring semantics are chosen.
- Fullscreen should be entered through an explicit control and include a visible exit control;
  browser-driven exit such as Escape remains available. Whether mobile launches directly into
  fullscreen or offers both embedded and fullscreen play remains open.

### Levels, packs, and progress

- Add local progress before considering cloud accounts. Progress data will need stable pack and
  level identities plus a versioning policy.
- Initial downloadable packs are trusted, vetted content hosted by the site. Define a versioned
  data format and validate it into the existing level shape rather than executing downloaded code.
- Arbitrary local pack loading is a stretch goal after the trusted format and error handling are
  proven.
- An in-game level/pack editor, user uploads, and cloud-synced accounts are later stretch goals.

### Presentation stretch goals

- Animated or otherwise richer backgrounds.
- Alternate characters and sprite-sheet themes that do not affect puzzle rules.
- Installable web-app support after the mobile and offline behavior is worth preserving.
