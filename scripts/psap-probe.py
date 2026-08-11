#!/usr/bin/env python3
"""
PSAP probe — send a handful of UDP commands to a Paradigm processor and print
whatever comes back. Useful for verifying that PSAP is enabled and that nothing
between you and the processor is dropping inbound UDP.

Usage:

    python3 scripts/psap-probe.py <host> [port]

Examples:

    python3 scripts/psap-probe.py 10.0.0.42
    python3 scripts/psap-probe.py paradigm.local 4703

Port defaults to 4703 (ETC's recommended PSAP port).
"""
import socket
import sys
import time

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

HOST = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 4703

COMMANDS = [
    "help",
    "pst get Houselight 3 -OFF",
    "macro get Macro 1",
]


def probe(cmd, timeout=2.0):
    print(f"\n--- sending: {cmd!r} ---")
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("", 0))
    local_port = s.getsockname()[1]
    print(f"    bound local UDP port {local_port}")
    s.settimeout(timeout)
    s.sendto((cmd + "\r").encode("ascii"), (HOST, PORT))
    deadline = time.time() + timeout
    got_any = False
    while time.time() < deadline:
        try:
            data, addr = s.recvfrom(4096)
            print(f"    REPLY from {addr}: {data!r}")
            got_any = True
        except socket.timeout:
            break
    if not got_any:
        print(f"    (no reply within {timeout}s)")
    s.close()


print(f"Target: {HOST}:{PORT}")
for c in COMMANDS:
    probe(c)
