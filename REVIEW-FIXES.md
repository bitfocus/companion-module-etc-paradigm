# Review fixes — PSAP rewrite

Status tracker for issues raised during the post-rewrite code review.
Checked items have been applied to the codebase.

## Bugs

- [x] **1. Remove dead-code branches in `_parseReply`** — collapsed to the single reachable `head === 'macro'` branch. `paradigm.js`.
- [x] **2. Surface PSAP error replies** — added `'psapError'` event in `paradigm.js`; logged at `warn` level in `main.js` so the user sees lines like `error invalid macro "Macro 1"` immediately.
- [x] **3. Document case-insensitive name matching** — added to HELP.md (Watched Objects → Naming rules).

## Edge cases

- [x] **4. Widen `watchKey` to include space** — composite map keyed by `(type, name, space)` plus a bare-name fallback index. `_onReply` prefers an exact match and falls back to bare-name entries when the reply's space isn't watched specifically.
- [x] **5. Auto-reconnect after socket error** — `_scheduleReconnect` fires 5 seconds after any socket error or open failure.
- [x] **6. Loosen host regex** — config field accepts hostnames as well as IPv4; label updated to "IP / Hostname".
- [x] **7. Watch-list `@` separator collides with names containing `@`** — documented in HELP.md (Watched Objects → Naming rules) with the workaround of dropping the `@ Space` suffix.
- [x] **8. Startup smoke test** — `_ping()` sends `help` after open and warns clearly if nothing replies within 2 seconds (firewall / wrong port / PSAP disabled).
- [x] **9. Action `space` value handling** — verified correct; no change needed.

## Documentation

- [x] **10. HELP example uses fake `Primary Space 1`** — replaced with realistic examples and a section explicitly noting space is optional.
- [x] **11. Troubleshooting section** — added covering PSAP enablement, macOS/Windows firewalls, running `psap-probe.py`, and wrong-name diagnostics via Raw Command.
- [x] **12. Document fire-and-forget actions** — called out in HELP.md (Actions section).
- [x] **13. Document `psap-probe.py` host override** — `usage` printed when run with no args; docstring updated.
- [x] **14. `CHANGELOG.md`** — added in Keep a Changelog format with `[Unreleased]` capturing this round and `[2.0.0]` capturing the PSAP rewrite.
- [x] **15. Bump `manifest.json` `apiVersion`** — `0.0.0` → `1.5.1` matching `@companion-module/base`.

## Style / nits

- [x] **16. `_pollOnce` switch → dispatch table** — `QUERIES` map at the bottom of `main.js` keyed by `entry.type`.
- [x] **17. `makeVariableId` collision handling** — `parseWatchList` tracks used IDs and appends `_2`, `_3`, … on collision.
- [x] **18. Deduplicate inline help vs HELP.md** — inline `static-text` shortened to a single sentence pointing at HELP.

## Verification

Smoke-tested locally with `node -e` after each change:

- All five module files parse (`node --check`).
- `parseWatchList` handles comments, type aliases, missing space, duplicate slugs (suffixed `_2`/`_3`), `:htp` flag.
- `_parseReply` correctly normalizes every reply shape seen in the v6.0 docs plus the `Macro on …` / `Wall open …` capitalized variants. `error …` lines fall through to the new error path.
- `watchKey` correctly produces `type|name` and `type|name|space` forms.

End-to-end testing against the live Paradigm processor is **pending** — see the unresolved "sends work, replies don't arrive" investigation in the connection log; the new `_ping()` warning should make the firewall vs. PSAP-config distinction obvious on next reconnect.
