import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

test('Rocket performance: server.js has compression, ETag caching, and bootstrap injection', () => {
  const serverCode = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.ok(serverCode.includes('__SYNTAX_BOOTSTRAP__'), 'server.js should inject __SYNTAX_BOOTSTRAP__ into index.html');
  assert.ok(serverCode.includes('brotliCompressSync') || serverCode.includes('gzipSync'), 'server.js should compress static assets');
  assert.ok(serverCode.includes('ETag') && serverCode.includes('304'), 'server.js should support ETag and 304 Not Modified');
});

test('Rocket performance: index.html defers scripts and preloads hero image', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(!html.includes('lenis.js'), 'index.html should not load wheel-hijacking lenis.js');
  assert.ok(html.includes('rel="preload" as="image" href="./assets/img/hero_students.png"'), 'index.html should preload hero_students.png');
  const scriptTags = html.match(/<script\b[^>]*\bsrc="[^"]+"[^>]*>/g) || [];
  assert.ok(scriptTags.length >= 7, 'index.html should include vendor and app scripts');
  for (const tag of scriptTags) {
    assert.ok(tag.includes('defer'), `Script tag should have defer attribute: ${tag}`);
  }
});

test('Rich Footer: includes social media links, study guidelines, and Made By Maged highlight link', () => {
  const appCode = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
  assert.ok(appCode.includes('https://www.instagram.com/magedinsta2/'), 'Footer must include Instagram link');
  assert.ok(appCode.includes('https://www.facebook.com/share/1ECRubwWis/'), 'Footer must include Facebook link');
  assert.ok(appCode.includes('https://github.com/Maged-Hany'), 'Footer must include GitHub link');
  assert.ok(appCode.includes('Made By '), 'Footer must include Made By Maged copyright');
  assert.ok(appCode.includes('maged-highlight'), 'Maged must be highlighted with .maged-highlight');
  assert.ok(appCode.includes('ftr-guidelines-list'), 'Footer must include study guidelines section');
});

test('Blocky Scroll Animation & Anti-AI Slop: no opacity-0 trap, no hero scroll fade-out, no ghost watermarks', () => {
  const cssCode = fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8');
  const appCode = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
  const coreCode = fs.readFileSync(path.join(root, 'assets/js/core.js'), 'utf8');

  assert.ok(!cssCode.includes('.js-anim [data-reveal]:not([data-r]) { opacity: 0; }'), 'styles.css must not hide unrevealed elements at opacity 0');
  assert.ok(cssCode.includes('@keyframes brutalBlockSnap'), 'styles.css must define brutalBlockSnap blocky animation');
  assert.ok(coreCode.includes('brutal-block-anim') && coreCode.includes('brutal-in'), 'core.js must apply blocky scroll animation classes');
  assert.ok(!appCode.includes("gsap.to('.hero-content', { yPercent: -14, opacity: 0"), 'app.js must not fade out hero content on scroll');
  assert.ok(!appCode.includes("className: 'l-num'"), 'app.js must not render ghost stroke .l-num watermark');
  assert.ok(!appCode.includes("className: 'panel-num'"), 'app.js must not render ghost stroke .panel-num watermark');
  assert.ok(!appCode.includes("className: 'ftr-big'"), 'app.js must not render giant .ftr-big watermark');
});

test('Curriculum integrity: all 28 bilingual lessons and meta.json are valid', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/meta.json'), 'utf8'));
  const lessonIds = meta.chapters.flatMap(c => c.lessons.map(l => l.id));
  assert.equal(lessonIds.length, 14, 'Should have 14 lessons across 4 chapters');
  for (const lang of ['ar', 'en']) {
    for (const id of lessonIds) {
      const p = path.join(root, 'data/lessons', lang, `${id}.json`);
      assert.ok(fs.existsSync(p), `Missing lesson file: ${p}`);
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      assert.ok(data.title && data.sections && data.sections.length > 0, `Invalid lesson structure in ${p}`);
      assert.ok(Array.isArray(data.quiz) && data.quiz.length >= 5, `Quiz missing in ${p}`);
    }
  }
});

test('ProgressMetrics pure logic: accurately computes completed lessons, quiz averages, study time, and 7-day history', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const ProgressMetrics = require(path.join(root, 'assets/js/progress-metrics.js'));
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/meta.json'), 'utf8'));

  assert.equal(ProgressMetrics.formatStudyDuration(2700, 'en').shortFormatted, '45m');
  assert.equal(ProgressMetrics.formatStudyDuration(5400, 'en').shortFormatted, '1h 30m');

  const fixedNow = new Date('2025-05-10T12:00:00Z');
  const todayKey = ProgressMetrics.toDateKey(fixedNow);
  const storeSample = {
    lessons: {
      '1-1': { completed: true, best: 6, total: 6, studySeconds: 1200 },
      '1-2': { completed: true, best: 5, total: 6, studySeconds: 1500 },
      '2-1': { completed: false, read: true, best: null, total: 6, studySeconds: 600 }
    },
    studyLog: {
      [todayKey]: 1800
    },
    dailyGoalMinutes: 30
  };

  const m = ProgressMetrics.computeDashboardMetrics(meta, storeSample, 'ar', fixedNow);
  assert.equal(m.totalLessons, 14);
  assert.equal(m.completedLessons, 2);
  assert.equal(m.inProgressLessons, 1);
  assert.equal(m.completionPct, 14);
  assert.equal(m.quizTakenCount, 2);
  assert.equal(m.avgQuizPct, Math.round((100 + 83) / 2));
  assert.equal(m.bestQuizPct, 100);
  assert.equal(m.totalStudySeconds, 3300);
  assert.equal(m.todayMinutes, 30);
  assert.equal(m.dailyGoalPct, 100);
  assert.equal(m.weeklySeries.length, 7);
  assert.equal(m.chapters.length, 4);
  assert.equal(m.chapters[0].completedCount, 2);
});

test('Student Profile Menu & Visual Progress Dashboard: wired into index.html, app.js, and styles.css', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const appCode = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8');

  assert.ok(html.includes('progress-metrics.js'), 'index.html must load progress-metrics.js');
  assert.ok(appCode.includes('function StudentProgressDashboard'), 'app.js must define StudentProgressDashboard');
  assert.ok(appCode.includes('smc-dashboard-cta'), 'Profile menu must include primary CTA to #/dashboard');
  assert.ok(appCode.includes("name: 'dashboard'"), 'Router must support #/dashboard route');
  assert.ok(cssCode.includes('.progress-dashboard-view') && cssCode.includes('.student-avatar-block'), 'styles.css must style the new profile button and dashboard');
});

