#!/usr/bin/env python3
"""
PSAP probe — send a few UDP commands to a Paradigm processor and print whatever
comes back. Usage:

    python3 scripts/psap-probe.py [host] [port]

Defaults: host=10.101.3.101, port=4703.
"""
import socket
import sys
import time

HOST = sys.argv[1] if len(sys.argv) > 1 else "10.101.3.101"
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
