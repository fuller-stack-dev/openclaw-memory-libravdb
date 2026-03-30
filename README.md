# LibraVDB Memory

## Install

Recommended on macOS:

```bash
brew tap xDarkicex/openclaw-libravdb-memory
brew install libravdbd
brew services start libravdbd
openclaw plugins install @xdarkicex/openclaw-memory-libravdb
```

Then activate the plugin in `~/.openclaw/openclaw.json`.

Manual plugin install:

```bash
openclaw plugins install @xdarkicex/openclaw-memory-libravdb
```

The published plugin is connect-only. It does not spawn a local binary during install or at runtime. For durable memory, run a local `libravdbd` daemon separately and point the plugin at its endpoint.

Minimum host version:

- OpenClaw `>= 2026.3.22`

Security note:

- the published plugin package contains no `postinstall`, no `openclaw.setup`, and no direct `child_process` usage
- the plugin only connects to a local `libravdbd` endpoint such as `unix:/Users/<you>/.clawdb/run/libravdb.sock` or `tcp:127.0.0.1:37421`
- after install, the plugin makes no required network calls for embedding or extractive compaction
- the only optional runtime network path is an explicitly configured remote summarizer endpoint such as `ollama-local`

## Daemon

Install and start `libravdbd` separately, then point the plugin at the running daemon if you do not want the default endpoint.

Default endpoints:

- macOS/Linux: `unix:$HOME/.clawdb/run/libravdb.sock`
- Windows: `tcp:127.0.0.1:37421`

Phase 2 packaging assets now live under [`packaging/`](./packaging):

- `packaging/systemd/libravdbd.service` for Linux user services
- `packaging/launchd/com.xdarkicex.libravdbd.plist` for macOS LaunchAgents
- `packaging/homebrew/libravdbd.rb.tmpl` as the source template for a generated Homebrew formula

Recommended service startup commands:

- macOS: `brew services start libravdbd`
- Linux: `systemctl --user enable --now libravdbd.service`

## Activate

Add this to `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "slots": {
      "memory": "libravdb-memory"
    },
    "configs": {
      "libravdb-memory": {
        "sidecarPath": "unix:/Users/<you>/.clawdb/run/libravdb.sock"
      }
    }
  }
}
```

Without the `plugins.slots.memory` entry, OpenClaw's default memory continues to run in parallel and this plugin does not take over the exclusive memory slot.

## Verify

Run:

```bash
openclaw memory status
```

Expected output includes a readable status table showing the daemon is reachable, stored turn/memory counts, the active ingestion gate threshold, and whether the abstractive summarizer is provisioned.
