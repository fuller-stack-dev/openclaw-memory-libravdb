# Install Guide

LibraVDB Memory is a connect-only OpenClaw plugin. Install the plugin as a
normal package, install `libravdbd` separately, and point the plugin at the
daemon endpoint when you need a non-default location.

For deeper operational detail, use the full
[installation reference](./installation.md).

## Recommended Path: Homebrew + OpenClaw Plugin

On macOS, the shortest supported path is:

```bash
brew tap xDarkicex/homebrew-openclaw-libravdb-memory
brew install libravdbd
brew services start libravdbd
openclaw plugins install @xdarkicex/openclaw-memory-libravdb
```

This gives you:

- a managed `libravdbd` service
- a scanner-clean plugin install
- a clean separation between plugin lifecycle and daemon lifecycle

## Plugin Install

Install the plugin package with the OpenClaw CLI:

```bash
openclaw plugins install @xdarkicex/openclaw-memory-libravdb
```

If you use the OpenClaw.ai plugin UI instead of the CLI, install the same
package and then assign the plugin id `libravdb-memory` to both the `memory`
and `contextEngine` slots.

Current install note:

- On current OpenClaw builds, `openclaw plugins install` may auto-switch `contextEngine` but leave `memory` unchanged. Always verify both slots after install.

Activate the plugin in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "slots": {
      "memory": "libravdb-memory",
      "contextEngine": "libravdb-memory"
    },
    "entries": {
      "libravdb-memory": {
        "enabled": true,
        "config": {
          "sidecarPath": "auto"
        }
      }
    }
  }
}
```

## Sidecar Daemon Install

The daemon owns the local database, embeddings, and JSON-RPC endpoint.

Default endpoints:

- macOS/Linux: `unix:$HOME/.clawdb/run/libravdb.sock`
- Windows: `tcp:127.0.0.1:37421`

Default data path:

- macOS/Linux/Windows user installs: `$HOME/.clawdb/data.libravdb`

### Homebrew

Homebrew is the preferred daemon lifecycle on macOS:

```bash
brew tap xDarkicex/homebrew-openclaw-libravdb-memory
brew install libravdbd
brew services start libravdbd
```

Useful lifecycle commands:

```bash
brew services restart libravdbd
brew services stop libravdbd
brew info libravdbd
```

### Manual Service Management

If you are not using Homebrew, manage the daemon explicitly.

Linux user service from the repo template:

```bash
# Replace vX.Y.Z with the published libravdbd release you want to install.
mkdir -p ~/.local/bin ~/.config/systemd/user
# Download the matching published libravdbd binary and service template.
curl -L -o ~/.local/bin/libravdbd <published-libravdbd-binary-url>
chmod +x ~/.local/bin/libravdbd
curl -L -o ~/.config/systemd/user/libravdbd.service <published-libravdbd-service-template-url>
systemctl --user enable --now libravdbd.service
```

macOS LaunchAgent from the repo template:

1. Download the published `com.xdarkicex.libravdbd.plist` template for your release.
2. Replace `__HOME__` with your home directory.
3. Save it to `~/Library/LaunchAgents/com.xdarkicex.libravdbd.plist`.
4. Load it with `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.xdarkicex.libravdbd.plist`.

### Windows

Windows uses a loopback TCP endpoint by default:

- `tcp:127.0.0.1:37421`

This guide does not yet include a full Windows service-install walkthrough.
For now, use the published Windows daemon asset from the GitHub releases page
and run it under your preferred process supervisor or a manual terminal session.

Foreground manual run:

```bash
libravdbd serve
```

That mode is useful for debugging or validating a local release asset before
you wrap it in `brew services`, `systemd`, or `launchd`.

## Lifecycle Management

### Plugin Lifecycle

- Install the package with `openclaw plugins install`.
- Activate it by assigning `libravdb-memory` to both `memory` and `contextEngine`.
- Update it with your normal OpenClaw plugin update flow.
- Disable it by removing the slot assignment from `~/.openclaw/openclaw.json`.

The plugin does not manage the daemon process. Treat plugin activation and
daemon supervision as separate lifecycle decisions.

### Daemon Lifecycle

- Start it with `brew services`, `systemd --user`, `launchctl bootstrap`, or a manual `libravdbd serve`.
- Restart it when you change daemon-level environment variables or replace the binary.
- Stop it before uninstalling or deleting on-disk data.
- Point the plugin at the correct endpoint with `sidecarPath` if you do not use the default location.

## Verification

After the plugin and daemon are both in place, run:

```bash
openclaw memory status
```

Also verify:

```bash
brew services list
openclaw plugins list
```

Healthy output should show that:

- the daemon answered the local health check
- the memory slot is active
- the plugin can read stored counts and runtime settings

If `openclaw memory status` is unavailable because your host excludes the bundled `memory` CLI surface via `plugins.allow`, use `openclaw plugins list` plus `brew services list` instead.

If OpenClaw cannot reach the daemon, verify the endpoint first:

- macOS/Linux default: `unix:$HOME/.clawdb/run/libravdb.sock`
- Windows default: `tcp:127.0.0.1:37421`
