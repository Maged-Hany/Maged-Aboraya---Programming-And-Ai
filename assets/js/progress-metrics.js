/* progress-metrics.js — pure, deterministic student progress, quiz score, and study-time analytics */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.App = root.App || {};
    root.App.ProgressMetrics = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function toDateKey(d) {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatStudyDuration(totalSeconds, lang = 'ar') {
    const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const totalMinutes = Math.round(secs / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const isAr = lang === 'ar';

    let formatted;
    let shortFormatted;
    if (hours > 0 && minutes > 0) {
      formatted = isAr ? `${hours} س و ${minutes} د` : `${hours}h ${minutes}m`;
      shortFormatted = isAr ? `${hours}س ${minutes}د` : `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      formatted = isAr ? `${hours} ساعة` : `${hours}h 0m`;
      shortFormatted = isAr ? `${hours}س` : `${hours}h`;
    } else {
      formatted = isAr ? `${totalMinutes} دقيقة` : `${totalMinutes} min`;
      shortFormatted = isAr ? `${totalMinutes} د` : `${totalMinutes}m`;
    }

    return {
      hours,
      minutes,
      totalMinutes,
      totalSeconds: secs,
      formatted,
      shortFormatted
    };
  }

  function getStudentRank(completedLessons, totalLessons, avgQuizPct, lang = 'ar') {
    const ratio = totalLessons > 0 ? completedLessons / totalLessons : 0;
    const isAr = lang === 'ar';
    if (ratio >= 1 && avgQuizPct >= 85) {
      return {
        level: 4,
        code: 'MASTER',
        title: isAr ? 'متقن المنهج بالكامل' : 'Curriculum Master',
        sub: isAr ? 'أنهيت جميع الفصول بتفوق في الاختبارات' : 'Completed all chapters with high quiz mastery',
        color: '#ffd233'
      };
    }
    if (ratio >= 0.5) {
      return {
        level: 3,
        code: 'ADVANCED',
        title: isAr ? 'مهندس برمجيات متقدم' : 'Advanced Builder',
        sub: isAr ? 'تخطيت نصف المنهج بنجاح وتطبيق عملي' : 'Passed the halfway mark with strong lab progress',
        color: '#16a34a'
      };
    }
    if (completedLessons >= 2) {
      return {
        level: 2,
        code: 'ACTIVE',
        title: isAr ? 'متعلّم نشط ومثابر' : 'Active Learner',
        sub: isAr ? 'بداية قوية في فهم الأساسيات وحل الاختبارات' : 'Consistent momentum across foundational lessons',
        color: '#2563eb'
      };
    }
    return {
      level: 1,
      code: 'STARTER',
      title: isAr ? 'مستكشف التقنية' : 'Tech Explorer',
      sub: isAr ? 'ابدأ رحلتك في الدروس والمحاكيات التفاعلية' : 'Begin your journey through lessons and simulators',
      color: '#ffd233'
    };
  }

  function computeDashboardMetrics(meta, storeData = {}, lang = 'ar', nowInput = null) {
    const isAr = lang === 'ar';
    const now = nowInput ? new Date(nowInput) : new Date();
    const chaptersMeta = (meta && Array.isArray(meta.chapters)) ? meta.chapters : [];
    const lessonsStore = (storeData && storeData.lessons) || {};
    const studyLog = (storeData && storeData.studyLog) || {};
    const dailyGoalMinutes = Math.max(10, Math.min(240, Number(storeData.dailyGoalMinutes) || 30));

    let totalLessons = 0;
    let completedLessons = 0;
    let inProgressLessons = 0;
    let notStartedLessons = 0;

    let quizTakenCount = 0;
    let sumQuizPct = 0;
    let bestQuizPct = 0;
    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;
    let totalStudySeconds = Math.max(0, Number(storeData.extraStudySeconds) || 0);

    const scoreDistribution = {
      excellent: 0, // >= 80%
      good: 0,      // 50% - 79%
      review: 0,    // < 50%
      remaining: 0  // not taken yet
    };

    const allLessons = [];
    const chapters = chaptersMeta.map((ch) => {
      const chLessons = Array.isArray(ch.lessons) ? ch.lessons : [];
      let chCompleted = 0;
      let chInProgress = 0;
      let chQuizCount = 0;
      let chQuizPctSum = 0;
      let chStudySeconds = 0;

      const enrichedLessons = chLessons.map((ls, idx) => {
        totalLessons += 1;
        const st = lessonsStore[ls.id] || {};
        const hasQuizScore = st.best != null && Number.isFinite(Number(st.best));
        const isCompleted = Boolean(hasQuizScore || st.completed);
        const isStarted = !isCompleted && Boolean(st.read || st.videoWatched || (Number(st.studySeconds) || 0) > 0);

        const qTotal = Math.max(1, Number(st.total) || 9);
        const qBest = hasQuizScore ? Math.max(0, Math.min(qTotal, Number(st.best))) : null;
        const quizPct = hasQuizScore ? Math.round((qBest / qTotal) * 100) : null;

        // Calculate study time for this lesson:
        // Use recorded studySeconds; if completed without timer seconds, credit the lesson's estimated minutes
        const recordedSecs = Math.max(0, Number(st.studySeconds) || 0);
        const effectiveSecs = recordedSecs > 0
          ? recordedSecs
          : isCompleted
            ? (Number(ls.minutes) || 16) * 60
            : isStarted
              ? Math.round((Number(ls.minutes) || 16) * 25)
              : 0;

        chStudySeconds += effectiveSecs;
        totalStudySeconds += effectiveSecs;

        let status = 'not-started';
        if (isCompleted) {
          status = 'completed';
          completedLessons += 1;
          chCompleted += 1;
        } else if (isStarted) {
          status = 'in-progress';
          inProgressLessons += 1;
          chInProgress += 1;
        } else {
          notStartedLessons += 1;
        }

        if (hasQuizScore) {
          quizTakenCount += 1;
          chQuizCount += 1;
          sumQuizPct += quizPct;
          chQuizPctSum += quizPct;
          if (quizPct > bestQuizPct) bestQuizPct = quizPct;
          totalEarnedPoints += qBest;
          totalPossiblePoints += qTotal;

          if (quizPct >= 80) scoreDistribution.excellent += 1;
          else if (quizPct >= 50) scoreDistribution.good += 1;
          else scoreDistribution.review += 1;
        } else {
          scoreDistribution.remaining += 1;
        }

        const item = {
          id: ls.id,
          numberLabel: `${ch.id}.${idx + 1}`,
          chapterId: ch.id,
          chapterTitle: (ch.title && (ch.title[lang] || ch.title.ar || ch.title.en)) || `Chapter ${ch.id}`,
          chapterAccent: ch.accent || '#2563eb',
          title: (ls.title && (ls.title[lang] || ls.title.ar || ls.title.en)) || ls.id,
          titleAr: (ls.title && ls.title.ar) || '',
          titleEn: (ls.title && ls.title.en) || '',
          estimatedMinutes: Number(ls.minutes) || 16,
          studySeconds: effectiveSecs,
          studyMinutes: Math.max(0, Math.round(effectiveSecs / 60)),
          status,
          isCompleted,
          isStarted,
          hasQuizScore,
          best: qBest,
          total: qTotal,
          quizPct,
          attempts: Math.max(hasQuizScore ? 1 : 0, Number(st.attempts) || 0),
          videoWatched: Boolean(st.videoWatched),
          lastStudiedAt: st.lastStudiedAt || null
        };
        allLessons.push(item);
        return item;
      });

      const chTotal = chLessons.length;
      const chPct = chTotal > 0 ? Math.round((chCompleted / chTotal) * 100) : 0;
      const chAvgQuizPct = chQuizCount > 0 ? Math.round(chQuizPctSum / chQuizCount) : null;

      return {
        id: ch.id,
        accent: ch.accent || '#2563eb',
        title: (ch.title && (ch.title[lang] || ch.title.ar || ch.title.en)) || `Chapter ${ch.id}`,
        blurb: (ch.blurb && (ch.blurb[lang] || ch.blurb.ar || ch.blurb.en)) || '',
        totalCount: chTotal,
        completedCount: chCompleted,
        inProgressCount: chInProgress,
        pct: chPct,
        avgQuizPct: chAvgQuizPct,
        studySeconds: chStudySeconds,
        studyMinutes: Math.round(chStudySeconds / 60),
        lessons: enrichedLessons
      };
    });

    const completionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const avgQuizPct = quizTakenCount > 0 ? Math.round(sumQuizPct / quizTakenCount) : 0;
    const studyDuration = formatStudyDuration(totalStudySeconds, lang);

    // Build 7-day study activity series ending today
    const todayKey = toDateKey(now);
    const weeklySeries = [];
    let weeklyTotalMinutes = 0;

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      const key = toDateKey(d);
      const dow = d.getDay();
      const rawSeconds = Math.max(0, Number(studyLog[key]) || 0);
      const mins = Math.round(rawSeconds / 60);
      weeklyTotalMinutes += mins;
      weeklySeries.push({
        dateKey: key,
        dayLabel: isAr ? DAY_NAMES_AR[dow] : DAY_NAMES_EN[dow],
        minutes: mins,
        seconds: rawSeconds,
        metGoal: mins >= dailyGoalMinutes,
        isToday: key === todayKey
      });
    }

    const todayEntry = weeklySeries[weeklySeries.length - 1] || { minutes: 0 };
    const todayMinutes = todayEntry.minutes;
    const dailyGoalPct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

    // Calculate active study streak (consecutive days with >0 study seconds up to today/yesterday)
    let streakDays = 0;
    for (let offset = 0; offset < 30; offset++) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      const key = toDateKey(d);
      const secs = Number(studyLog[key]) || 0;
      if (secs > 0) {
        streakDays += 1;
      } else if (offset === 0) {
        // If today has 0 so far, check if yesterday had a streak
        continue;
      } else {
        break;
      }
    }
    if (streakDays === 0 && completedLessons > 0) {
      streakDays = 1;
    }

    // Next recommended lesson
    const nextRecommendedLesson =
      allLessons.find(l => l.status === 'in-progress') ||
      allLessons.find(l => l.status === 'not-started') ||
      allLessons[0] ||
      null;

    // Strongest chapter
    const strongestChapter = chapters
      .slice()
      .sort((a, b) => (b.pct - a.pct) || ((b.avgQuizPct || 0) - (a.avgQuizPct || 0)))[0] || null;

    const rank = getStudentRank(completedLessons, totalLessons, avgQuizPct, lang);

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      notStartedLessons,
      completionPct,
      quizTakenCount,
      avgQuizPct,
      bestQuizPct,
      totalEarnedPoints,
      totalPossiblePoints,
      totalStudySeconds,
      totalStudyMinutes: studyDuration.totalMinutes,
      studyDuration,
      dailyGoalMinutes,
      todayMinutes,
      dailyGoalPct,
      weeklyTotalMinutes,
      weeklySeries,
      streakDays,
      scoreDistribution,
      chapters,
      allLessons,
      nextRecommendedLesson,
      strongestChapter,
      rank
    };
  }

  return {
    toDateKey,
    formatStudyDuration,
    getStudentRank,
    computeDashboardMetrics
  };
});
