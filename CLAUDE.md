# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@oxog/deps** is a zero-runtime dependency analysis toolkit for Node.js projects. It uses a micro-kernel plugin architecture to provide dependency analysis features including circular dependency detection, unused/missing dependency detection, duplicate version detection, bundle size analysis, security auditing, and monorepo support.

**Key constraint**: This project has **zero runtime dependencies** - every feature is implemented from scratch using only Node.js built-in modules.

## Development Commands

```bash
# Build the project (TypeScript -> dual CJS/ESM outputs)
npm run build

# Run tests (Vitest with 95%+ coverage thresholds)
npm run test
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# Type checking
npm run typecheck           # TypeScript strict mode check

# Linting and formatting
npm run lint                # ESLint
npm run format              # Prettier

# Before publishing (build + test coverage required)
npm run prepublishOnly
```

**Running a single test**:
```bash
npx vitest run tests/path/to/test.test.ts
```

## Architecture

### Micro-Kernel Plugin System

The codebase is organized around a central kernel ([`src/kernel.ts`](src/kernel.ts)) that manages plugins via an event-driven architecture:

- **Event Bus** ([`src/core/event-bus.ts`](src/core/event-bus.ts)) - Decoupled communication between components
- **Cache Manager** ([`src/core/cache.ts`](src/core/cache.ts)) - Performance optimization
- **Package Parser** ([`src/core/parser.ts`](src/core/parser.ts)) - Reads package.json files
- **Traverser** ([`src/core/traverser.ts`](src/core/traverser.ts)) - Walks dependency graphs

### Plugin Structure

Plugins register event handlers with the kernel:
- **Core plugins** (always loaded): `tree`, `circular`
- **Optional plugins** (opt-in): `unused`, `missing`, `duplicates`, `size`, `updates`, `security`, `monorepo`

Plugin lifecycle:
1. `install(kernel)` - Register event handlers
2. Listen to events: `analyze`, `progress`, `finding`, `complete`
3. Use `kernel.reportFinding()` to report results

Event names use snake_case convention (`analyze`, `progress`, `finding`).

### Entry Points

The build outputs multiple entry points via `tsup`:
- **Main** ([`src/index.ts`](src/index.ts)) - Public API exports
- **Plugins** ([`src/plugins/index.ts`](src/plugins/index.ts)) - Plugin exports
- **CLI** ([`src/cli.ts`](src/cli.ts)) - Command-line interface (`deps` command)
- **MCP** ([`src/mcp/index.ts`](src/mcp/index.ts)) - Model Context Protocol server

### Output Formats

Analysis results can be exported to multiple formats via [`src/formats/`](src/formats/):
- JSON (programmatic use)
- ASCII tree (terminal display)
- Markdown (documentation)
- HTML (web reports)

## Code Conventions

- **TypeScript strict mode** - No implicit `any`, full type coverage required
- **ESM only** - Source uses `.js` extensions in imports (build outputs both ESM and CJS)
- **Plugin naming**: Kebab-case in API (`duplicate-deps`), PascalCase in implementation (`DuplicateDepsPlugin`)
- **Event naming**: snake_case for all event names
- **JSDoc comments** - All public APIs documented with JSDoc
- **Error hierarchy** - Custom error types extend base classes in [`src/errors.ts`](src/errors.ts)

## Key Patterns

1. **Zero dependencies** - All functionality implemented from scratch using only Node.js built-ins
2. **Event-driven** - Components communicate via the event bus, not direct calls
3. **Factory pattern** - `createAnalyzer()` for creating analyzer instances
4. **Builder pattern** - Fluent API for configuration (`.on()`, `.use()`, `.run()`)
5. **Format adapters** - Results are format-agnostic until exported

## Testing

- Test files in [`tests/`](tests/) with `*.test.ts` naming
- Coverage thresholds: 95% lines, 90% functions/branches, 95% statements
- Use `vitest` globals (no need to import describe/test/expect)
- Mock Node.js built-ins (fs, path) for unit tests where appropriate
- Test files should test both success and error paths

## Build System

Uses **tsup** for fast TypeScript bundling:
- Dual output: CJS (`*.cjs`) and ESM (`*.js`) with TypeScript declarations
- Source maps enabled for debugging
- Tree-shaking enabled
- Entry points defined in [`tsup.config.ts`](tsup.config.ts)
