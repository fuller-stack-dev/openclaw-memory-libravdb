---
name: libravdb-memory
description: Compatibility metadata for OpenClaw production installation.
---

# LibraVDB Memory Hook Metadata

This package ships a native OpenClaw plugin with a compiled JavaScript runtime
under `dist/`.

`HOOK.md` is included so OpenClaw installation flows that validate hook-pack
metadata do not reject the published package for missing compatibility files.
It does not bootstrap the daemon or change the plugin's connect-only install
model.
