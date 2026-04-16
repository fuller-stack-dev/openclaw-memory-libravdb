# Contributing

## Prerequisites

- Node.js `>= 22`
- `pnpm`
- OpenClaw CLI for end-to-end plugin testing

## Core Validation Commands

TypeScript and unit checks:

```bash
pnpm check
```

Integration tests:

```bash
npm run test:integration
```

Plugin integration tests:

```bash
npm run test:integration
```

## Local Daemon Build

```bash
bash scripts/build-daemon.sh
```

This prepares `.daemon-bin/libravdbd` for local plugin testing and copies locally available bundled assets into `.daemon-bin/`.

Supported inputs:

- installed daemon on `PATH` such as `brew install libravdbd`
- `LIBRAVDBD_BINARY_PATH=/path/to/libravdbd`
- `LIBRAVDBD_SOURCE_DIR=/path/to/libravdbd` to build from your private local daemon repo

For daemon-internal Go development and release work, use the separate `libravdbd` repository.

## Gating Invariants

Do not weaken the gate invariants casually. The daemon-owned tests in `libravdbd/compact/gate_test.go` check structural properties:

- empty-memory novelty
- saturation veto
- convex boundedness
- conversational collapse at `T = 0`
- technical collapse at `T = 1`
- non-overfiring conversational structure on code

If you add a new signal, it must preserve those invariants.

## Calibration Coverage

There is not yet a dedicated `gate_calibration_test.go` golden set in the
repository. Current gating correctness is enforced by the invariant suite in
`libravdbd/compact/gate_test.go`.

If you introduce new signals or change weighting behavior, do not only update
the implementation. Add one of:

- a new invariant if the change alters a structural property of the gate
- a dedicated calibration/golden test file if the change adds new labeled
  examples or expected decompositions

Do not rewrite expectations just to make regressions disappear.

## PR Expectations

Before opening a PR:

- `pnpm check` must pass
- plugin integration coverage must pass against a running daemon or a prepared local daemon binary
- any new gating signal must come with calibration or invariant coverage
- any retrieval math or gating change must be reflected in the private design notes

## Release Versioning

`package.json` is the source of truth for the release version.

The release automation syncs `openclaw.plugin.json` from `package.json` during the
auto-bump/tag flow, and the publish workflow refuses to publish if the Git tag,
`package.json`, and `openclaw.plugin.json` versions do not all match.
