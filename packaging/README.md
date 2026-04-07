# Packaging Assets

This directory contains Phase 2 daemon-distribution assets for `libravdbd`.

- `systemd/libravdbd.service`: user-service template for Linux.
- `launchd/com.xdarkicex.libravdbd.plist`: LaunchAgent template for macOS.
- `homebrew/libravdbd.rb.tmpl`: source template used to generate a publish-ready Homebrew formula.

The templates assume the default daemon endpoint contract used by the plugin:

- macOS/Linux: `unix:$HOME/.clawdb/run/libravdb.sock`
- Windows: `tcp:127.0.0.1:37421`

Before loading the macOS plist, replace:

- `__LIBRAVDBD_PATH__` with the absolute path to the `libravdbd` binary
- `__HOME__` with the current user's home directory

The release workflow now generates `dist/libravdbd.rb` from this template using
the release version and SHA-256 files. If `HOMEBREW_TAP_REPO` and
`HOMEBREW_TAP_TOKEN` are configured in GitHub Actions, the workflow also updates
the tap automatically.

The Homebrew formula stages the bundled ONNX Runtime archive, the shipped
embedding profile assets, and the T5 summarizer bundle into the install prefix
so the daemon can boot without an extra asset-unpack step.

Expected GitHub configuration:

- repository variable `HOMEBREW_TAP_REPO`, for example `xDarkicex/homebrew-openclaw-libravdb-memory`
- repository secret `HOMEBREW_TAP_TOKEN` with push access to that tap repo

Template placeholders:

- `__VERSION__`
- `__SHA256_DARWIN_ARM64__`
- `__SHA256_DARWIN_AMD64__`
- `__SHA256_LINUX_ARM64__`
- `__SHA256_LINUX_AMD64__`
