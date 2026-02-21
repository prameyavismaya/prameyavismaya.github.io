#!/usr/bin/env python3
"""
deploy.py — push website changes to GitHub Pages
Usage: python3 deploy.py
"""

import subprocess
import sys


def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.returncode != 0:
        print(f"Error: {result.stderr.strip()}")
        sys.exit(1)
    return result.stdout.strip()


# Show what has changed
status = run("git status --short")
if not status:
    print("Nothing to commit — no changes detected.")
    sys.exit(0)

print("Changed files:")
print(status)
print()

# Ask for a commit message
message = input("Commit message: ").strip()
if not message:
    print("Aborted — commit message cannot be empty.")
    sys.exit(1)

# Stage, commit, push
run("git add -A")
run(f'git commit -m "{message}"')
run("git push origin main")

print("\nDone! Changes are live at https://prameyavismaya.github.io")
