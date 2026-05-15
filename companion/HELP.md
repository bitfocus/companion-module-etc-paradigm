# ETC Paradigm (PSAP)

A Companion module for controlling ETC Paradigm Architectural Control Systems via the **Paradigm Serial Access Protocol (PSAP)** over UDP.

> **Supports Paradigm Serial Access Protocol v5.x and v6.x.** Earlier firmware that only exposed the legacy HTTP/JSON web interface is no longer supported by this version of the module — pin to module v1.0.7 if you still need that.

## Prerequisites — configure PSAP in LightDesigner

PSAP is **off by default** on the processor. In LightDesigner:

1. Select the Paradigm Processor in the Browser → Property Editor.
2. Expand **UDP Serial Config**.
3. Set **Input UDP Port** to a value in `4703-4727` (the module defaults to `4703`).
4. Set **Input Handler** to **PSAP 6.0.0** (or `PSAP 5.0.0` on older firmware).
5. Push the configuration to the processor.

Without this step the module will sit idle — Paradigm silently ignores UDP traffic it has no handler for.

## Configuration

| Field | Notes |
| --- | --- |
| **Paradigm Processor IP** | The processor's IP address. |
| **PSAP UDP Port** | Match the **Input UDP Port** set in LightDesigner. Default `4703`. |
| **End of Message** | `CR` (default), `CR + LF`, or `LF` — must match LightDesigner. |
| **Polling Interval (ms)** | How often each watched object is queried for status. Default `5000`. |
| **Watched Objects** | One per line. Drives variables + feedbacks. See below. |

### Watched Objects

PSAP has no enumeration command, so you tell the module which objects you care about. Each line creates a variable and makes the object available to feedbacks.

```
type Name [@ Space]
```

Type tokens: `pst` (preset), `macro`, `chan` (channel), `wall`, `seq` (sequence), `ovr` (override), `grp` (group). Append `:htp` to a preset to query HTP state: `pst:htp Preset 1`.

Names are **case-sensitive** and must match LightDesigner exactly. Avoid commas and colons in object names — PSAP uses both as delimiters.

Example:

```
pst Houselight 1 -100%
pst Houselight 3 -OFF @ Primary Space 1
macro Macro 1
chan Dimmer 2 @ Primary Space 1
wall Wall 1
seq Sequence 1
ovr Override 1
```

## Actions

| Action | PSAP equivalent |
| --- | --- |
| Macro: On / Off / Toggle / Cancel | `macro on\|off\|tog\|cancel <name>` |
| Preset: Activate / Deactivate / Toggle / Record (LTP & HTP) | `pst act\|dact\|tog\|acth\|dacth\|togh\|rec <name>[, <space>][, <fade>]` |
| Channel: Set Level | `chan int:<n>% <name>[, <space>][, <fade>]` |
| Channel: Raise / Lower | `chan ras\|low:<n>% <name>[, <space>][, <fade>]` |
| Channel: Toggle | `chan tog <name>[, <space>][, <fade>]` |
| Wall: Open / Close / Toggle | `wall open\|close\|tog <name>[, <space>]` |
| Sequence: Start / Stop / Pause / Resume | `seq start\|stop\|pause\|resume <name>[, <space>]` |
| Sequence: Set Rate | `seq rate:<n> <name>` |
| Override: Enable / Disable / Toggle | `ovr enab\|disab\|tog <name>` |
| Space: Off / Master / Raise / Lower | `spc off\|master:<n>%\|ras:<n>%\|low:<n>% <name>[, <fade>]` |
| Send Raw PSAP Command | Whatever you type, terminated for you. |

All text fields support Companion variables.

## Feedbacks & Variables

Every line in **Watched Objects** creates a Companion variable that updates from the processor's polled status. Feedback dropdowns are populated from that list — so add an object to Watched Objects first, then reference it in a feedback.

| Feedback | Compares against |
| --- | --- |
| Macro State | `on` / `off` / `running` |
| Preset State | `act` / `dact` / `alt` (LTP) or `acth` / `dacth` / `alth` (HTP) |
| Wall State | `open` / `close` |
| Sequence State | `start` (running) / `stop` / `pause` |
| Override State | `enab` / `disab` |
| Channel Level Comparison | `=`, `!=`, `>`, `>=`, `<`, `<=` against a level in PSAP units (0–255) |

## Troubleshooting

- **`Unexpected token < in JSON …`** — you're on the legacy v1.x of this module against a v4+ processor. Upgrade.
- **No status updates** — confirm PSAP is enabled in LightDesigner and the Input UDP Port matches. From the Companion host: `printf 'help\r' | nc -u -w1 <ip> 4703`. You should see a list of commands come back.
- **Action fires but nothing happens** — check the object name's spelling and case. Send `macro get YourMacro` via the Raw Command action and watch the log for a reply.
