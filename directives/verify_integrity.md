# SOP: Platform Integrity & Verification

## Goal
Deterministically verify the structural integrity, data completeness, and API responsiveness of the learning platform before and after code changes.

## Tool to Use
- `execution/verify_platform.py`

## Verification Checks
1. Schema and syntax validation of:
   - `data/meta.json`
   - `data/texts.json`
   - `data/users.json`
   - `data/videos.json`
2. Cross-referencing all chapters and lessons in `data/meta.json` to verify that both Arabic (`ar`) and English (`en`) lesson files exist on disk.
3. Server endpoint availability check on `http://localhost:3000`:
   - `/api/meta`
   - `/api/status`
   - `/api/site/texts`

## Execution Command
```powershell
python execution/verify_platform.py
```

## Expected Output
`[SUCCESS] All files and schemas verified with zero errors.`
