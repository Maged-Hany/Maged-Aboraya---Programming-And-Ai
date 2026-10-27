# SOP: Platform Management & Content Maintenance

## Goal
Manage curriculum content, site texts, student progress store, video lectures, and ensure platform health and deterministic execution.

## Inputs
- Curriculum data: `data/meta.json`
- Lesson files: `data/lessons/ar/{id}.json` and `data/lessons/en/{id}.json`
- Texts dictionary: `data/texts.json`
- Videos store: `data/videos.json`
- Environment variables: `.env`

## Execution Tools
- `execution/verify_platform.py`: Deterministic verification tool for validating all files, schemas, and API endpoints.

## Procedures

### 1. Modifying Site Texts
- **Option A (In-Browser Live Editor):** Click "تعديل نصوص الموقع" in the footer or press `Ctrl + Shift + E`. Modify any text and click "حفظ وتطبيق التعديلات".
- **Option B (Direct File):** Open `data/texts.json` directly. Update the value for any key under `"ar"` or `"en"`. Save file.

### 2. Adding or Updating Lessons
- Update `data/meta.json` with chapter and lesson metadata.
- Create/update `data/lessons/ar/{chapter}-{lesson}.json` and `data/lessons/en/{chapter}-{lesson}.json`.
- Run `python execution/verify_platform.py` to confirm schema integrity.

### 3. Setting Lesson Video Lectures
- In the lesson view, use the "إضافة / تعديل رابط الفيديو" button, or edit `data/videos.json` with the YouTube URL or MP4 link mapped to `{lessonId}`.

### 4. Running Health Check
```bash
python execution/verify_platform.py
```
Outputs validation status for all data files, schemas, and server endpoints.
