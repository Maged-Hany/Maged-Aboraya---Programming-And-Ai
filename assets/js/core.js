/* core.js — shared helpers: i18n, storage, smooth scroll, scroll-reveal engine */
(function () {
  const { useState, useEffect, useContext, createContext } = React;
  const h = React.createElement;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- UI strings ---------- */
  const STR = {
    ar: {
      brand: 'Maged Aboraya',
      grade: 'الصف الثاني الثانوي · البكالوريا',
      chapter: 'الفصل',
      lesson: 'الدرس',
      lessons: 'دروس',
      min: 'دقيقة',
      gateKicker: 'قبل أن نبدأ',
      gateTitle: 'أنت في أي قسم؟',
      gateAr: 'عربي',
      gateArSub: 'المنهج كاملًا بالعربية',
      gateEn: 'Languages (English + عربي)',
      gateEnSub: 'English curriculum + ترجمة عربية مرافقة وصور حقيقية',
      switchTo: 'English + ترجمة عربي',
      heroKicker: 'منهج البرمجة والذكاء الاصطناعي',
      heroTitle: ['افهم', 'كيف', 'يعمل', 'العالم', 'الرقمي.'],
      heroSub: 'دروس تفاعلية، أمثلة محلولة، واختبارات قصيرة بعد كل درس. نفس منهج الكتاب، لكن بطريقة تُستكشف بدل أن تُحفظ.',
      heroCta: 'ابدأ التعلّم',
      scrollHint: 'مرّر للأسفل',
      stats: ['فصول', 'درسًا', 'سؤال تدريبي'],
      manifesto: 'كل درس هنا أُعيد بناؤه ليُستكشف: تحرّك، اضغط، اقلب، جرّب، ثم اختبر نفسك. لا صفحات جامدة، ولا حفظ بلا فهم.',
      chaptersKicker: 'الفصول الأربعة',
      chaptersTitle: 'أربعة فصول، رحلة واحدة',
      start: 'ابدأ',
      cont: 'تابع',
      review: 'راجع',
      notReady: 'قريبًا',
      done: 'مكتمل',
      progress: 'تقدّمك',
      of: 'من',
      footerRights: 'جميع الحقوق محفوظة',
      footerNote: '',
      home: 'الرئيسية',
      objectives: 'أهداف الدرس',
      keyTerms: 'مصطلحات أساسية',
      keyTermsHint: 'اضغط على أي مصطلح لرؤية معناه',
      recap: 'خلاصة الدرس',
      practice: 'حلّ وتطبيق',
      practiceSub: 'جرّب الحل بنفسك أولًا، ثم افتح الإجابة النموذجية.',
      showSol: 'اعرض الحل',
      hideSol: 'أخفِ الحل',
      finishTitle: 'خلّصت الشرح؟',
      finishText: 'لازم تقرأ الدرس للنهاية قبل الاختبار. بعد ما تخلص اضغط الزر وابدأ الاختبار.',
      finishBtn: 'خلّصت الشرح — ابدأ الاختبار',
      readFirst: 'أكمل القراءة للنهاية لتفتح الاختبار',
      quiz: 'اختبار الدرس',
      question: 'سؤال',
      check: 'تحقق من الإجابة',
      next: 'التالي',
      seeResult: 'اعرض النتيجة',
      correct: 'إجابة صحيحة',
      wrong: 'إجابة غير صحيحة',
      explanation: 'التوضيح',
      tTrue: 'صح',
      tFalse: 'خطأ',
      choose: 'اختر…',
      matchHint: 'طابق كل عنصر بما يناسبه',
      score: 'نتيجتك',
      retry: 'أعد الاختبار',
      best: 'أفضل نتيجة',
      nextLesson: 'الدرس التالي',
      backChapter: 'العودة إلى الفصول',
      msgHigh: 'ممتاز! فاهم الدرس كويس.',
      msgMid: 'جيد! راجع النقاط التي أخطأت فيها وحاول مرة أخرى.',
      msgLow: 'ما تقلقش. ارجع للشرح وحاول تاني.',
      loading: 'جارٍ التحميل…',
      prepTitle: 'هذا الدرس قيد الإعداد',
      prepText: 'سيظهر هنا قريبًا.',
      error: 'تعذّر تحميل الدرس. تأكد من تشغيل الخادم.',
      copy: 'نسخ',
      copied: 'تم النسخ',
      section: 'القسم',
      sensitiveNote: 'كل ما تكتبه يبقى في متصفحك فقط.',
      zenMode: 'وضع التركيز',
      zenModeHint: 'قراءة هادئة بدون مشتتات (Z)',
      zenExit: 'إنهاء وضع التركيز',
      zenEsc: 'ESC للخروج',
      zenFontNormal: 'خط عادي',
      zenFontBig: 'خط كبير',
      siteTitle: 'البرمجة والذكاء الاصطناعي',
      siteSub: 'شرح مبسّط لكل درس، أمثلة وصور حقيقية، تمارين محلولة، واختبار قصير في نهاية كل درس.',
      startFirst: 'ابدأ الدرس الأول',
      continueLesson: 'كمّل من حيث توقفت',
      allDone: 'خلّصت كل الدروس! راجع أي درس',
      browse: 'تصفّح الفصول',
      yourProgress: 'تقدّمك',
      lessonsDone: 'درس مكتمل',
      avgScore: 'متوسط الاختبارات',
      stream: 'القسم',
      chaptersTitle2: 'الفصول والدروس',
      chaptersSub: 'اختر أي درس وابدأ مباشرة.',
      inChapter: 'شخصيات وأجهزة في هذا الفصل',
      allChapters: 'كل الفصول',
      onThisPage: 'في هذا الدرس',
      minRead: 'دقيقة قراءة',
      prevLesson: 'الدرس السابق',
      textSize: 'حجم الخط',
      youWillLearn: 'ستتعلم في هذا الدرس',
      showAll: 'اعرض الكل',
      hideAll: 'أخفِ الكل',
      translationOn: 'الترجمة العربية: ظاهرة',
      translationOff: 'إظهار الترجمة العربية',
      listen: 'استمع',
      stop: 'إيقاف',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      speed: 'السرعة',
      close: 'إغلاق',
      searchPh: 'ابحث عن درس أو مصطلح أو شخصية…',
      search: 'بحث',
      lightMode: 'الوضع النهاري',
      darkMode: 'الوضع الليلي'
    },
    en: {
      brand: 'Maged Aboraya',
      grade: 'Grade 11 · Baccalaureate',
      chapter: 'Chapter',
      lesson: 'Lesson',
      lessons: 'lessons',
      min: 'min',
      gateKicker: 'Before we start',
      gateTitle: 'Which stream are you in?',
      gateAr: 'عربي',
      gateArSub: 'المنهج كاملًا بالعربية',
      gateEn: 'Languages (English + عربي)',
      gateEnSub: 'English curriculum + Arabic translation & real photos',
      switchTo: 'عربي',
      heroKicker: 'Programming & AI curriculum',
      heroTitle: ['Understand', 'how', 'the', 'digital', 'world', 'works.'],
      heroSub: 'Interactive lessons, worked exercises and a short quiz after every lesson. The same curriculum as the book, built to be explored instead of memorised.',
      heroCta: 'Start learning',
      scrollHint: 'Scroll',
      stats: ['chapters', 'lessons', 'practice questions'],
      manifesto: 'Every lesson here is rebuilt to be explored: move, tap, flip, try, then test yourself. No static pages, and no memorising without understanding.',
      chaptersKicker: 'The four chapters',
      chaptersTitle: 'Four chapters, one journey',
      start: 'Start',
      cont: 'Continue',
      review: 'Review',
      notReady: 'Soon',
      done: 'Completed',
      progress: 'Your progress',
      of: 'of',
      footerRights: 'All rights reserved',
      footerNote: '',
      home: 'Home',
      objectives: 'Learning objectives',
      keyTerms: 'Key terms',
      keyTermsHint: 'Tap any term to reveal its meaning',
      recap: 'Recap',
      practice: 'Solve & apply',
      practiceSub: 'Try each one yourself first, then open the model answer.',
      showSol: 'Show solution',
      hideSol: 'Hide solution',
      finishTitle: 'Finished the explanation?',
      finishText: 'Read the lesson to the end first. When you are done, press the button and take the quiz.',
      finishBtn: 'I finished reading — start the quiz',
      readFirst: 'Keep reading to the end to unlock the quiz',
      quiz: 'Lesson quiz',
      question: 'Question',
      check: 'Check answer',
      next: 'Next',
      seeResult: 'See result',
      correct: 'Correct',
      wrong: 'Not quite',
      explanation: 'Why',
      tTrue: 'True',
      tFalse: 'False',
      choose: 'Choose…',
      matchHint: 'Match each item with its partner',
      score: 'Your score',
      retry: 'Retake quiz',
      best: 'Best score',
      nextLesson: 'Next lesson',
      backChapter: 'Back to chapters',
      msgHigh: 'Excellent. You clearly understood this lesson.',
      msgMid: 'Good. Review the points you missed and try again.',
      msgLow: 'No worries. Go back through the explanation and retry.',
      loading: 'Loading…',
      prepTitle: 'This lesson is being prepared',
      prepText: 'It will appear here soon.',
      error: 'Could not load the lesson. Make sure the server is running.',
      copy: 'Copy',
      copied: 'Copied',
      section: 'Section',
      sensitiveNote: 'Everything you type stays in your browser.',
      zenMode: 'Focus Mode',
      zenModeHint: 'Distraction-free reading (Z)',
      zenExit: 'Exit Focus Mode',
      zenEsc: 'ESC to exit',
      zenFontNormal: 'Normal font',
      zenFontBig: 'Large font',
      siteTitle: 'Programming & AI',
      siteSub: 'Clear explanations for every lesson, real photos and examples, worked exercises, and a short quiz at the end of each lesson.',
      startFirst: 'Start the first lesson',
      continueLesson: 'Continue where you left off',
      allDone: 'You finished every lesson! Review any of them',
      browse: 'Browse chapters',
      yourProgress: 'Your progress',
      lessonsDone: 'lessons completed',
      avgScore: 'Average quiz score',
      stream: 'Stream',
      chaptersTitle2: 'Chapters & lessons',
      chaptersSub: 'Pick any lesson and jump straight in.',
      inChapter: 'People and devices in this chapter',
      allChapters: 'All chapters',
      onThisPage: 'In this lesson',
      minRead: 'min read',
      prevLesson: 'Previous lesson',
      textSize: 'Text size',
      youWillLearn: 'In this lesson you will',
      showAll: 'Show all',
      hideAll: 'Hide all',
      translationOn: 'Arabic translation: on',
      translationOff: 'Show Arabic translation',
      listen: 'Listen',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      speed: 'Speed',
      close: 'Close',
      searchPh: 'Search lessons, key terms, people…',
      search: 'Search',
      lightMode: 'Light mode',
      darkMode: 'Dark mode'
    }
  };

  /* ---------- persistent state ---------- */
  const KEY = 'mabook:v1';
  const readStore = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const Store = {
    data: readStore(),
    subs: new Set(),
    set(patch) {
      Store.data = { ...Store.data, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(Store.data)); } catch (e) { /* private mode */ }
      Store.subs.forEach(fn => fn(Store.data));
    },
    setLesson(id, patch) {
      const lessons = { ...(Store.data.lessons || {}) };
      lessons[id] = { ...(lessons[id] || {}), ...patch };
      Store.set({ lessons });
    }
  };
  function useStore() {
    const [data, setData] = useState(Store.data);
    useEffect(() => { Store.subs.add(setData); return () => Store.subs.delete(setData); }, []);
    return data;
  }

  /* ---------- language context ---------- */
  const LangCtx = createContext({ lang: 'en', t: STR.en, dir: 'ltr' });
  const useLang = () => useContext(LangCtx);

  /* ---------- fetch with cache ---------- */
  const cache = new Map();
  function getJSON(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then(r => {
        if (!r.ok) { const e = new Error(String(r.status)); e.status = r.status; throw e; }
        return r.json();
      }).catch(e => { cache.delete(url); throw e; }));
    }
    return cache.get(url);
  }

  /* ---------- scrolling (native: fast and predictable on every device) ---------- */
  function initSmoothScroll() { /* native scrolling is used on purpose */ }
  const HEADER_OFFSET = 76;
  function scrollToY(y, immediate) {
    window.scrollTo({ top: Math.max(0, y), behavior: immediate || reduced ? 'auto' : 'smooth' });
  }
  function scrollToEl(el, offset) {
    if (!el) return;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - (offset == null ? HEADER_OFFSET : offset));
  }
  const getLenis = () => null;

  /* ---------- reveal engine ----------
     Content is always visible immediately (no blank areas while scrolling).
     Only the timeline progress line is animated. */
  const made = [];
  function scan(root) {
    if (reduced || typeof ScrollTrigger === 'undefined') return;
    const scope = root || document;
    scope.querySelectorAll('[data-draw]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const fill = el.querySelector('.tl-fill');
      if (!fill) return;
      const tw = gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 60%', scrub: true } });
      made.push(tw);
    });
  }
  function killAll() {
    while (made.length) {
      const tw = made.pop();
      if (tw.scrollTrigger) tw.scrollTrigger.kill();
      tw.kill();
    }
    ScrollTrigger.getAll().forEach(s => s.kill());
  }
  function useScan(dep) {
    useEffect(() => {
      const id = requestAnimationFrame(() => scan());
      return () => cancelAnimationFrame(id);
    });
  }

  /* ---------- tiny components ---------- */
  function Words({ text, tag, className }) {
    const T = tag || 'span';
    return h(T, { className: className || '' }, Array.isArray(text) ? text.join(' ') : text);
  }
  function ScrubWords({ text, className }) {
    return h('p', { className: 'scrub ' + (className || ''), 'data-scrub-words': '' },
      String(text).split(' ').map((w, i) => h('span', { className: 'sw', key: i }, w, ' ')));
  }

  
  /* ---------- Text-to-Speech (TTS) Engine ---------- */
  const TTS = {
    synth: typeof window !== 'undefined' ? window.speechSynthesis : null,
    speaking: false,
    paused: false,
    currentId: null,
    currentText: '',
    currentLangHint: null,
    rate: 1.0,
    subs: new Set(),
    voices: [],
    init() {
      if (!TTS.synth) return;
      const load = () => {
        try { TTS.voices = TTS.synth.getVoices() || []; } catch (e) { TTS.voices = []; }
      };
      load();
      if (typeof TTS.synth.onvoiceschanged !== 'undefined') {
        TTS.synth.onvoiceschanged = load;
      }
    },
    notify() {
      const state = { speaking: TTS.speaking, paused: TTS.paused, id: TTS.currentId, text: TTS.currentText, rate: TTS.rate };
      TTS.subs.forEach(fn => fn(state));
    },
    getVoices() {
      if (!TTS.synth) return [];
      if (!TTS.voices || !TTS.voices.length) {
        try { TTS.voices = TTS.synth.getVoices() || []; } catch (e) { TTS.voices = []; }
      }
      return TTS.voices;
    },
    getArabicVoice() {
      const voices = TTS.getVoices();
      if (!voices || !voices.length) return null;
      let v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
      if (v) return v;
      const arNames = ['arabic', 'hoda', 'salma', 'naayf', 'zeina', 'tarik', 'maged', 'shakir', 'laila', 'mariam'];
      v = voices.find(v => arNames.some(name => (v.name || '').toLowerCase().includes(name)));
      return v || null;
    },
    getEnglishVoice() {
      const voices = TTS.getVoices();
      if (!voices || !voices.length) return null;
      return voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.default))
          || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
          || null;
    },
    speak(text, langHint, id, force) {
      if (!TTS.synth) return;
      
      if (!force && TTS.speaking && TTS.currentId === id) {
        TTS.stop();
        return;
      }

      if (TTS.synth.speaking || TTS.speaking) {
        try { TTS.synth.cancel(); } catch (e) {}
      }

      const clean = String(text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
      if (!clean) return;

      const isAr = (langHint === 'ar') || /[\u0600-\u06FF]/.test(clean);

      setTimeout(() => {
        try {
          if (TTS.synth.paused) TTS.synth.resume();
          
          const u = new SpeechSynthesisUtterance(clean);
          u.rate = TTS.rate;
          
          if (isAr) {
            const arVoice = TTS.getArabicVoice();
            if (arVoice) {
              u.voice = arVoice;
              u.lang = arVoice.lang || 'ar-SA';
            } else {
              u.lang = 'ar-SA';
            }
          } else {
            const enVoice = TTS.getEnglishVoice();
            if (enVoice) {
              u.voice = enVoice;
              u.lang = enVoice.lang || 'en-US';
            } else {
              u.lang = 'en-US';
            }
          }

          u.onstart = () => {
            TTS.speaking = true;
            TTS.paused = false;
            TTS.currentId = id || 'tts-' + Date.now();
            TTS.currentText = clean;
            TTS.currentLangHint = langHint || (isAr ? 'ar' : 'en');
            TTS.notify();
            clearInterval(TTS._ping);
            TTS._ping = setInterval(() => {
              if (TTS.speaking && !TTS.paused && TTS.synth) {
                try { TTS.synth.pause(); TTS.synth.resume(); } catch (e) {}
              }
            }, 10000);
          };
          u.onend = () => {
            clearInterval(TTS._ping);
            TTS.speaking = false;
            TTS.paused = false;
            TTS.currentId = null;
            TTS.currentText = '';
            TTS.notify();
          };
          u.onerror = (e) => {
            clearInterval(TTS._ping);
            TTS.speaking = false;
            TTS.paused = false;
            TTS.currentId = null;
            TTS.currentText = '';
            TTS.notify();
          };

          TTS.synth.speak(u);
        } catch (err) {
          console.warn('TTS speak error:', err);
        }
      }, 60);
    },
    pause() {
      if (TTS.synth && TTS.speaking && !TTS.paused) {
        try { TTS.synth.pause(); } catch (e) {}
        TTS.paused = true;
        TTS.notify();
      }
    },
    resume() {
      if (TTS.synth && TTS.speaking && TTS.paused) {
        try { TTS.synth.resume(); } catch (e) {}
        TTS.paused = false;
        TTS.notify();
      }
    },
    stop() {
      clearInterval(TTS._ping);
      if (TTS.synth) {
        try { TTS.synth.cancel(); } catch (e) {}
      }
      TTS.speaking = false;
      TTS.paused = false;
      TTS.currentId = null;
      TTS.currentText = '';
      TTS.notify();
    },
    setRate(r) {
      TTS.rate = r;
      if (TTS.speaking && TTS.currentText) {
        const text = TTS.currentText;
        const lang = TTS.currentLangHint;
        const id = TTS.currentId;
        TTS.stop();
        setTimeout(() => {
          TTS.speak(text, lang, id, true);
        }, 80);
      } else {
        TTS.notify();
      }
    }
  };
  TTS.init();

  /* ---------- Comprehensive Search Index Database ---------- */
  const SEARCH_ITEMS = [
    // Lessons
    { type: 'lesson', id: '1-1', title: 'The Evolution of IT and Social Transformation', titleAr: 'تطور تكنولوجيا المعلومات والتحول المجتمعي', ch: 1, keywords: 'computer eniac moore vacuum tubes microprocessors internet cloud حاسوب إينياك صمامات مفرغة معالجات سحابية' },
    { type: 'lesson', id: '1-2', title: 'How Artificial Intelligence Works', titleAr: 'كيفية عمل الذكاء الاصطناعي', ch: 1, keywords: 'ai machine learning deep learning neural network turing mccarthy ذكاء اصطناعي تعلم آلي شبكات عصبية تورينج' },
    { type: 'lesson', id: '1-3', title: 'AI in Daily Life and Industry', titleAr: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', ch: 1, keywords: 'self driving waymo healthcare surgical robot da vinci smart factory drone طب جراحة سيارات ذاتية مصانع زراعة' },
    { type: 'lesson', id: '1-4', title: 'Ethical Issues Related to AI', titleAr: 'القضايا الأخلاقية المرتبطة بالذكاء الاصطناعي', ch: 1, keywords: 'bias fairness black box privacy copyright deepfake surveillance أخلاقيات تحيز خصوصية تزييف عميق مراقبة حقوق ملكية' },
    { type: 'lesson', id: '2-1', title: 'Encryption and Authentication Techniques', titleAr: 'تقنيات التشفير والمصادقة', ch: 2, keywords: 'cryptography caesar cipher symmetric asymmetric rsa passwords mfa 2fa yubikey biometrics تشفير قيصر متماثل مفتاح عام كلمة مرور مصادقة بصمة' },
    { type: 'lesson', id: '2-2', title: 'Network Security Design', titleAr: 'تصميم أمان الشبكات', ch: 2, keywords: 'firewall dmz ids ips zero trust ddos botnet wifi wpa3 جدار ناري منطقة منزوعة السلاح انعدام الثقة هجمات حجب الخدمة راوتر' },
    { type: 'lesson', id: '2-3', title: 'Incident Response and Risk Management', titleAr: 'الاستجابة للحوادث وإدارة المخاطر', ch: 2, keywords: 'soc incident nist ransomware backup 3-2-1 risk social engineering phishing طوارئ فدية نسخ احتياطي مخاطر تصيد احتيالي هندسة اجتماعية' },
    { type: 'lesson', id: '3-1', title: 'General Architecture of Web Applications', titleAr: 'البنية العامة لتطبيقات الويب', ch: 3, keywords: 'web tim berners-lee client server dns cdn url ip next submarine cables خادم عميل ألياف ضوئية سيرن' },
    { type: 'lesson', id: '3-2', title: 'Communication Methods in Web Applications', titleAr: 'طرق الاتصال في تطبيقات الويب', ch: 3, keywords: 'http https get post put delete status codes 200 404 500 rest api websocket wireshark بروتوكول طلبات استجابة واجهة برمجة' },
    { type: 'lesson', id: '3-3', title: 'Front-End Technology Basics', titleAr: 'أساسيات تقنيات الواجهة الأمامية', ch: 3, keywords: 'html html5 css javascript js dom box model brendan eich hakon lie devtools تنسيق هيكل تفاعل برمجة واجهات' },
    { type: 'lesson', id: '4-1', title: 'Media Types and Their Properties', titleAr: 'أنواع الوسائط وخصائصها', ch: 4, keywords: 'raster vector bitmap svg pixels jpeg png webp mp4 lossy lossless bitrate وسائط نقطية متجهة بكسل ضغط جودة فيديو صوت' },
    { type: 'lesson', id: '4-2', title: 'Information Design and User Experience', titleAr: 'تصميم المعلومات وتجربة المستخدم للمواقع', ch: 4, keywords: 'ux ui information architecture don norman affordance feedback wcag contrast accessibility wireframe إتاحة وصول تباين ألوان دلالة تجربة مستخدم واجهة' },
    { type: 'lesson', id: '4-3', title: 'Methods of Evaluating Websites', titleAr: 'طرق تقييم المواقع الإلكترونية', ch: 4, keywords: 'usability testing jakob nielsen heuristics core web vitals lcp inp cls bounce rate heatmaps a/b testing اختبار قابلية استخدام سرعة استقرار بصري خرائط حرارية' },
    { type: 'lesson', id: '4-4', title: 'Iterative Improvement Process for Websites', titleAr: 'عملية التحسين التكراري للمواقع الإلكترونية', ch: 4, keywords: 'iterative agile kanban user feedback regression testing ci/cd staging production seo maintenance تحسين تكراري اختبار انحدار بيئة تجربة نشر مستمر صيانة' },

    // Demos and Interactive Labs
    { type: 'demo', id: '1-1', target: '#/lesson/1-1', title: 'Moore’s Law Simulator', titleAr: 'محاكي قانون مور لمضاعفة الترانزستورات', keywords: 'moore law transistor doubling calculator 1971 2025 محاكي ترانزستور حساب' },
    { type: 'demo', id: '2-1', target: '#/lesson/2-1', title: 'Interactive Caesar Cipher Lab', titleAr: 'مختبر شفرة قيصر التفاعلي وعجلة التشفير', keywords: 'caesar shift encode decode secret wheel تشفير قيصر إزاحة فك شفرة' },
    { type: 'demo', id: '2-1', target: '#/lesson/2-1', title: 'Password Strength & Entropy Analyzer', titleAr: 'محلل قوة كلمات المرور وزمن الاختراق', keywords: 'password entropy brute force crack time قوة كلمة مرور كسر تخمين أمان' },
    { type: 'demo', id: '3-2', target: '#/lesson/3-2', title: 'Live HTTP Server Request Simulator', titleAr: 'محاكي خادم HTTP المباشر للطلبات والاستجابات', keywords: 'http request simulator get post json api محاكي طلبات خادم ردود' },
    { type: 'demo', id: '3-3', target: '#/lesson/3-3', title: 'Live HTML/CSS/JS Sandbox Playground', titleAr: 'محرر الأكواد الحي لتقنيات الويب', keywords: 'html css javascript code editor live sandbox ملعب تجربة كود برمجة مباشر' },
    { type: 'demo', id: '4-2', target: '#/lesson/4-2', title: 'WCAG Color Contrast Laboratory', titleAr: 'مختبر فحص تباين الألوان ومعايير الإتاحة', keywords: 'wcag contrast checker aa aaa accessibility ratio فاحص تباين ألوان وصول إتاحة' },

    // Real Hardware & Pioneers
    { type: 'figure', id: '1-1', target: '#/lesson/1-1', title: 'Gordon Moore & ENIAC (1945)', titleAr: 'جوردون مور وحاسوب إينياك العملاق', keywords: 'gordon moore eniac intel 4004 vacuum tubes transistors حاسوب تاريخي صمامات' },
    { type: 'figure', id: '1-2', target: '#/lesson/1-2', title: 'Alan Turing & John McCarthy', titleAr: 'آلان تورينج وجون مكارثي ورواد الذكاء', keywords: 'alan turing john mccarthy turing test dartmouth علماء حاسوب اختبار ذكاء' },
    { type: 'figure', id: '1-3', target: '#/lesson/1-3', title: 'Waymo Autonomous Car & Da Vinci Robot', titleAr: 'سيارة وايمو ذاتية القيادة وروبوت دافنشي', keywords: 'waymo self driving lidar da vinci surgical robot روبوت طبي سيارة ذكية ليدار' },
    { type: 'figure', id: '2-1', target: '#/lesson/2-1', title: 'Julius Caesar & Enigma Cipher Machine', titleAr: 'يوليوس قيصر وآلة إنجما للتشفير', keywords: 'caesar enigma machine cipher world war آلة تشفير ميكانيكية تاريخية' },
    { type: 'figure', id: '2-1', target: '#/lesson/2-1', title: 'YubiKey Hardware Key & Biometrics', titleAr: 'مفتاح الأمان المادي YubiKey وبصمة الإصبع', keywords: 'yubikey hardware 2fa usb token fingerprint scanner مفتاح أمان مادي مصادقة ثنائية' },
    { type: 'figure', id: '2-2', target: '#/lesson/2-2', title: 'Hardware Firewall & Ethernet Switch', titleAr: 'جهاز الجدار الناري وموزع الشبكة السلكية', keywords: 'hardware firewall appliance switch cisco rj45 cables جدار ناري موزع شبكة كابلات' },
    { type: 'figure', id: '2-3', target: '#/lesson/2-3', title: 'Security Operations Center (SOC) & NAS', titleAr: 'مركز العمليات الأمنية SOC ووحدات النسخ NAS', keywords: 'security operations center soc nas backup monitors غرفة مراقبة أمنية نسخ احتياطي' },
    { type: 'figure', id: '3-1', target: '#/lesson/3-1', title: 'Sir Tim Berners-Lee & NeXT Web Server', titleAr: 'السير تيم بيرنرز لي وأول خادم ويب', keywords: 'tim berners-lee cern next computer first server مخترع الويب أول سيرفر' },
    { type: 'figure', id: '3-1', target: '#/lesson/3-1', title: 'Undersea Submarine Fiber-Optic Cable', titleAr: 'كابل الألياف الضوئية البحري للإنترنت', keywords: 'submarine optical cable ocean cross section كابل بحري ألياف ضوئية قاع المحيط' },
    { type: 'figure', id: '3-3', target: '#/lesson/3-3', title: 'Brendan Eich (JS) & Håkon Wium Lie (CSS)', titleAr: 'بريندان آيك (مبتكر JS) وهاكون لي (مبتكر CSS)', keywords: 'brendan eich javascript hakon wium lie css web devtools مبتكر جافاسكريبت مصمم' },
    { type: 'figure', id: '4-2', target: '#/lesson/4-2', title: 'Don Norman & Refreshable Braille Display', titleAr: 'دون نورمان وجهاز سطر برايل للمكفوفين', keywords: 'don norman everyday things braille display accessibility مكفوفين سطر برايل رائد تجربة' },
    { type: 'figure', id: '4-3', target: '#/lesson/4-3', title: 'Jakob Nielsen & Eye-Tracking Usability Lab', titleAr: 'ياكوب نيلسن وأجهزة تتبع حركة العين', keywords: 'jakob nielsen usability eye tracking glasses heatmaps خبير قابلية استخدام تتبع النظر' },

    // Key Terms & Concepts
    { type: 'term', id: '2-1', target: '#/lesson/2-1', title: 'Zero Trust Architecture', titleAr: 'بنية انعدام الثقة (Zero Trust)', keywords: 'never trust always verify perimeter security أمان تحقق دائم شبكات' },
    { type: 'term', id: '2-2', target: '#/lesson/2-2', title: 'DDoS Attack & Botnets', titleAr: 'هجمات حجب الخدمة الموزعة وروبوتات البوت نت', keywords: 'distributed denial of service botnet zombie nodes هجوم تعطيل سيرفر حجب' },
    { type: 'term', id: '3-2', target: '#/lesson/3-2', title: 'REST APIs & WebSockets', titleAr: 'واجهات برمجة التطبيقات REST وبروتوكول WebSockets', keywords: 'rest api json stateless websocket real time اتصال تطبيقات سحابية فوري' },
    { type: 'term', id: '4-2', target: '#/lesson/4-2', title: 'Affordance & Feedback Principles', titleAr: 'مبادئ الدلالة Affordance والتغذية الراجعة', keywords: 'affordance feedback don norman clickable buttons دلالة استجابة تفاعل فوري' },
    { type: 'term', id: '4-3', target: '#/lesson/4-3', title: 'Google Core Web Vitals (LCP, INP, CLS)', titleAr: 'معايير أداء الويب الحيوية لجوجل', keywords: 'lcp largest contentful paint inp interactivity cls cumulative layout shift سرعة تحميل استقرار بصري' },
    { type: 'term', id: '4-4', target: '#/lesson/4-4', title: 'Regression Testing & CI/CD Pipelines', titleAr: 'اختبار الانحدار وخطوط النشر المستمر', keywords: 'regression testing automated tests staging production ci cd فحص أخطاء بيئة تجربة نشر' }
  ];

  function search(query, lang) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return SEARCH_ITEMS.filter(it => {
      const corpus = (it.title + ' ' + (it.titleAr || '') + ' ' + (it.keywords || '') + ' ' + it.type).toLowerCase();
      return tokens.every(tok => corpus.includes(tok));
    }).slice(0, 12);
  }

  window.App = {
    h, STR, Store, useStore, LangCtx, useLang, getJSON, initSmoothScroll, scrollToY, scrollToEl, getLenis,
    scan, killAll, useScan, Words, ScrubWords, reduced, TTS, search, SEARCH_ITEMS
  };
})();

