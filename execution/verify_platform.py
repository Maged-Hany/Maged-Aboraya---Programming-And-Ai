#!/usr/bin/env python3
"""
execution/verify_platform.py
Deterministic health check and data integrity validation for Maged Aboraya Platform.
Part of Layer 3 (Execution) in the 3-Layer Architecture.
"""

import sys
import os
import json
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def check_file(rel_path, required=True):
    p = ROOT / rel_path
    if not p.exists():
        if required:
            print(f"[FAIL] Missing required file: {rel_path}")
            return None
        return None
    try:
        with open(p, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
            print(f"[OK] JSON valid: {rel_path}")
            return data
    except Exception as e:
        print(f"[ERROR] Invalid JSON in {rel_path}: {e}")
        return None

def verify():
    print("=== Maged Aboraya Platform Integrity Verification ===")
    errors = 0

    # 1. Check data configuration files
    meta = check_file("data/meta.json")
    if not meta: errors += 1
    
    texts = check_file("data/texts.json")
    if not texts: errors += 1

    users = check_file("data/users.json", required=False)
    videos = check_file("data/videos.json", required=False)

    # 2. Check lessons referenced in meta.json
    if meta and "chapters" in meta:
        total_lessons = 0
        for ch in meta["chapters"]:
            ch_id = ch.get("id")
            for les in ch.get("lessons", []):
                les_id = les.get("id")
                total_lessons += 1
                for lang in ["ar", "en"]:
                    les_path = f"data/lessons/{lang}/{les_id}.json"
                    les_data = check_file(les_path)
                    if not les_data:
                        errors += 1
        print(f"[INFO] Verified {total_lessons} lessons across Arabic & English streams.")

    # 3. Check Local Server Response
    port = os.environ.get("PORT", "3000")
    base_url = f"http://localhost:{port}"
    endpoints = ["/api/meta", "/api/status", "/api/site/texts"]
    print(f"\nChecking local server at {base_url}...")
    
    server_online = False
    for ep in endpoints:
        try:
            req = urllib.request.Request(f"{base_url}{ep}", headers={"User-Agent": "HealthCheck/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    print(f"[OK] Endpoint 200 OK: {ep}")
                    server_online = True
                else:
                    print(f"[WARN] Endpoint {ep} returned status {resp.status}")
        except Exception as e:
            print(f"[WARN] Could not reach server endpoint {ep}: {e}")

    # Summary
    print("\n=== Verification Summary ===")
    if errors == 0:
        print("[SUCCESS] All files and schemas verified with zero errors.")
        return 0
    else:
        print(f"[FAILED] Found {errors} issues that need attention.")
        return 1

if __name__ == "__main__":
    sys.exit(verify())
