# ETC Paradigm (PSAP)

A Companion module for controlling ETC Paradigm Architectural Control Systems via the **Paradigm Serial Access Protocol (PSAP)** over UDP.

> **Supports Paradigm Serial Access Protocol v5.x and v6.x.** Earlier firmware that only exposed the legacy HTTP/JSON web interface is no longer supported — pin to module v1.0.7 if you still need that.

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
| **Paradigm Processor IP / Hostname** | IPv4 address or DNS name reachable from this Companion host. |
| **PSAP UDP Port** | Match the **Input UDP Port** set in LightDesigner. Default `4703`. |
| **End of Message** | `CR` (default), `CR + LF`, or `LF` — must match LightDesigner. |
| **Polling Interval (ms)** | How often each watched object is queried for status. Default `5000`. |
| **Watched Objects** | One per line. Drives variables + feedbacks. See below. |

### Watched Objects

PSAP has no enumeration command, so you tell the module which objects you care about. Each line creates a variable and makes the object available to feedbacks.

```
type Name [@ Space]
```

| Token | Meaning |
| --- | --- |
| `pst` | Preset (append `:htp` to query HTP state, e.g. `pst:htp Some Preset`) |
| `macro` | Macro |
| `chan` | Channel |
| `wall` | Wall |
| `seq` | Sequence |
| `ovr` | Override |
| `grp` | Group |

**Space is optional.** Omit it and Paradigm will resolve the object wherever it lives; the module records the reply against the bare name. Include `@ Space` only when you have two objects with the same name in different spaces.

**Naming rules:**
- Names are matched **case-insensitively here**, but PSAP itself is case-sensitive — type the name exactly as it appears in LightDesigner.
- Avoid commas and colons in object names — PSAP uses both as delimiters.
- If an object name contains `@`, watch it without the `@ Space` suffix (the `@` would otherwise be parsed as the separator).
- Lines starting with `#` are treated as comments.

**Example:**

```
# Houselights
pst Houselight 1 -100%
pst Houselight 3 -OFF
pst Houselight 5 -Show

# Macros + a channel
macro Macro 1
chan Dimmer 2

# Same preset name in two spaces — disambiguate with @
pst Walk-in @ KO Houselights
pst Walk-in @ Foyer
```

## Actions

All actions are **fire-and-forget** — the command is sent but the reply (success or PSAP error) is only visible via the connection log. State updates surface through polling, so a buttonpress that should change something will show up as a variable change on the next poll tick.

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

Every line in **Watched Objects** creates a Companion variable that updates from the processor's polled status. Feedback dropdowns are populated from that list — add an object to Watched Objects first, then reference it in a feedback.

| Feedback | Compares against |
| --- | --- |
| Macro State | `on` / `off` / `running` |
| Preset State | `act` / `dact` / `alt` (LTP) or `acth` / `dacth` / `alth` (HTP) |
| Wall State | `open` / `close` |
| Sequence State | `start` (running) / `stop` / `pause` |
| Override State | `enab` / `disab` |
| Channel Level Comparison | `=`, `!=`, `>`, `>=`, `<`, `<=` against a level in PSAP units (0–255) |

> **Note on channel comparisons:** actions accept 0–100% for ergonomics, but Paradigm returns levels in raw 0–255 PSAP units, and the feedback compares in those units. `255` is full, `128` is roughly half.

## Troubleshooting

### "Unexpected token < in JSON" on the very first version

You're on legacy module v1.x against v4+ firmware. Upgrade to v2.x.

### Commands send but state never updates

This is almost always one of:

1. **PSAP isn't enabled or the port mismatches.** In LightDesigner check that the processor's **Input UDP Port** is what you put in Companion, and **Input Handler** is `PSAP 5.0.0` or higher.

2. **A firewall is dropping inbound UDP to Companion.** On macOS, check **System Settings → Network → Firewall**. If on, either turn off temporarily to verify, or under **Options…** allow incoming connections for the Companion process. On Windows, check Defender Firewall's inbound rules for Companion.

3. **The processor isn't sending replies.** Confirm from outside Companion by running the bundled probe:

   ```
   python3 scripts/psap-probe.py <paradigm-ip> [port]
   ```

   You should see `REPLY from …` lines. If you do but Companion doesn't, the firewall is the cause (see point 2). If you don't, the issue is on the Paradigm side.

4. **The object name is wrong.** PSAP is case-sensitive and rejects unknown names. Use the **Send Raw PSAP Command** action with `macro get YourMacroName` and watch the connection log — you'll see either a state line or `error invalid macro …`.

### Action fires but nothing changes on the lights

- Wrong name (most common). Try `... get` via Raw Command.
- Wrong space. Drop the `@ Space` part to let Paradigm resolve.
- Wrong action variant — e.g. trying to activate a preset as HTP when it's configured as LTP. Try the other variant.

## Reference

- [Paradigm Serial Access Protocol v6.0 Configuration Guide (ETC)](https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737519244)
- [Paradigm Serial Access Protocol support page](https://support.etcconnect.com/ETC/Architectural/Paradigm/Paradigm_Serial_Access_Protocol_PSAP)
