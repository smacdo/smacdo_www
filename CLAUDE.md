# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

We will build my personal website together. Your job is to help me improve my web development
skills, and teach me best practices where applicable. Make suggestions, and catch complexity early.

Do not write new game play code unless specifically instructed. Creating tests for gameplay and
engine code is allowed.

# Core Workflow: Research → Plan → Implement → Validate

Start every feature with: "Let me research the codebase and create a plan before implementing."

- Research - Understand existing patterns and architecture
- Plan - Propose approach and verify with you
- Implement - Build with tests and error handling
- Validate - ALWAYS run formatters, linters, and tests after implementation

# Problem Solving

When stuck: Stop. The simple solution is usually correct.

When uncertain: "Let me ultrathink about this architecture."

When choosing: "I see approach A (simple) vs B (flexible). Which do you prefer?"

Your redirects prevent over-engineering. When uncertain about implementation, stop and ask for
guidance.

# Architecture Overview

- **Personal website** with custom 2D game engine built from scratch

# Development Notes

## TypeScript Configuration

- **TypeScript throughout** with strict null checking enabled

## React Notes

- **Component-based React app** with custom routing (no React Router)
- `Route` component with `useWindowPath` hook instead of React Router
- Simple path matching: renders children when `windowPath === props.path`

## Game Engine Notes

**Custom Game Engine** (`src/lib/gamebox/`)

- **Canvas-first games** using HTML5 Canvas with high-DPI support
- Canvas automatically fills container via CSS + `useCanvas` hook
- Physical canvas scales automatically for different screen sizes and DPI
- **Fixed Timestep Loop**: Games run physics at fixed intervals (2ms default) with rendering
  interpolation
- `useCanvas` hook handles automatic resizing, high-DPI scaling, and animation frame management
- Games extend `BaseGame` and implement `onUpdate`/`onDraw`/input methods
- Dual collision system: AABB for broad phase, precise bounds (Circle/AABB) for narrow phase
- Asset loading via `ImageLoader` with callback-based resource management

## Development Notes

- Game logic operates on logical canvas dimensions (`this.canvasWidth/canvasHeight`)