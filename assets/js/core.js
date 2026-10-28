/* core.js — shared helpers: i18n, storage, smooth scroll, scroll-reveal engine */
(function () {
  const { useState, useEffect, useContext, createContext } = React;
  const h = React.createElement;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) document.documentElement.classList.add('js-anim');

  /* ---------- UI strings ---------- */
  const STR = {
    ar: {
      siteTitle: 'Syntax — اتعلم البرمجة والذكاء الاصطناعي صح',
      brand: 'Syntax',
      copyrightOwner: 'AborayaTechnologies',
      coursesNav: 'الكورسات',
      grade: 'كورسات برمجية عملية من الصفر',
      chapter: 'الفصل',
      lesson: 'الدرس',
      lessons: 'دروس',
      min: 'دقيقة',
      gateKicker: 'قبل ما نبدأ',
      gateTitle: 'عايز تدرس بأنهي لغة؟',
      gateAr: 'عربي (AR)',
      gateArSub: 'الشرح والتطبيقات كلها بالعربي وبطريقة عملية وبسيطة',
      gateEn: 'إنجليزي (EN)',
      gateEnSub: 'المحتوى بالإنجليزي مع ترجمة وشرح عربي يساعدك خطوة بخطوة',
      switchTo: 'EN',
      heroKicker: 'اتعلم بجد ومن غير تعقيد',
      heroTitle: ['اتعلم', 'البرمجة', 'وافهم', 'التكنولوجيا', 'صح.'],
      heroSub: 'منصة تفاعلية بتشرحلك البرمجة، وتطوير الويب، والأمن السيبراني، والذكاء الاصطناعي بشكل عملي وممتع — دروس مباشرة، معامل كود حية تجرب فيها بإيدك، واختبارات تثبت المعلومة في دماغك بعد كل درس.',
      heroCta: 'شوف الكورسات',
      scrollHint: 'انزل شوف الكورسات',
      stats: ['مسارات وكورسات', 'درس تفاعلي', 'تمرين وتطبيق عملي'],
      manifesto: 'كل درس ومسار هنا مبني عشان تجربه بنفسك: دوس، حرك، اقلب الكروت، وجرب الكود في المعامل الحية، واختبر فهمك خطوة بخطوة. مفيش دش كلام نظري، ولا حفظ من غير ما تفهم الدنيا ماشية إزاي.',
      chaptersKicker: 'مسارات التعلّم',
      chaptersTitle: 'اختر الكورس وابدأ فوراً',
      coursesKicker: 'دليل الكورسات',
      coursesTitle: 'كورسات ومسارات برمجية عملية تجهزك صح',
      coursesSub: 'اختر الكورس اللي يناسبك، واتعلم خطوة بخطوة من الصفر لحد الاحتراف مع مشاريع وتطبيقات حقيقية.',
      openCourse: 'ادخل على الكورس',
      backToCourses: 'ارجع لكل الكورسات',
      allChapters: 'فصول الكورس الأربعة',
      start: 'ابدأ دلوقتي',
      cont: 'كمّل',
      review: 'راجع تاني',
      notReady: 'قريباً',
      done: 'خلّصته',
      progress: 'مستوى تقدمك',
      of: 'من',
      footerRights: 'جميع الحقوق محفوظة',
      footerNote: '',
      home: 'الرئيسية',
      objectives: 'هتتعلم إيه في الدرس ده؟',
      keyTerms: 'مصطلحات مهمة تفهمها',
      keyTermsHint: 'اضغط على أي مصطلح عشان تشوف معناه ببساطة',
      recap: 'الزتونة وخلاصة الدرس',
      practice: 'تمارين وتطبيقات عملية',
      practiceSub: 'فكر في حل كل سؤال وجرب بنفسك الأول، وبعدين شوف الإجابة النموذجية وقارن.',
      showSol: 'شوف الإجابة النموذجية',
      hideSol: 'خبي الإجابة',
      finishTitle: 'فهمت الدرس ومستعد؟',
      finishText: 'اتأكد إنك عديت على كل نقطة في الشرح وجربت المعامل الحية، ودوس على الزرار اللي تحت عشان تختبر فهمك.',
      finishBtn: 'قريت وفهمت — يلا نبدأ الكويز',
      readFirst: 'كمّل قراءة الدرس للآخر عشان يفتحلك الاختبار',
      quiz: 'اختبار الدرس',
      question: 'السؤال',
      check: 'تأكد من إجابتك',
      next: 'السؤال اللي بعده',
      seeResult: 'شوف النتيجة',
      correct: 'إجابة صح ومظبوطة! 🎯',
      wrong: 'مش مظبوطة، راجع النقطة دي',
      explanation: 'ليه الإجابة كده؟ (الشرح العملي)',
      tTrue: 'صح',
      tFalse: 'غلط',
      choose: 'اختر الإجابة الصح…',
      matchHint: 'وصّل كل عنصر في العمود الأول باللي يناسبه في العمود التاني',
      score: 'درجتك',
      retry: 'عيد الاختبار تاني',
      best: 'أعلى سكور حققته',
      nextLesson: 'ادخل على الدرس الجاي',
      backChapter: 'ارجع لفهرس الكورس',
      msgHigh: 'عاش جداً! بجد استيعابك للدرس ده ممتاز وفاهم الفكرة صح.',
      msgMid: 'أداء حلو! راجع النقط البسيطة اللي وقعت منك وجرب تاني وهتجيب الدرجة النهائية.',
      msgLow: 'ولا تشيل هم! خدلك بصة هادية على الشرح تاني وجرب، الموضوع بيثبت بالممارسة.',
      loading: 'ثواني بنحمّل…',
      prepTitle: 'الدرس ده شغالين عليه حالياً',
      prepText: 'هيكون متاح هنا قريب جداً.',
      error: 'حصلت مشكلة في تحميل الدرس، معلش جرب تاني.',
      copy: 'نسخ الكود',
      copied: 'اتنسخ تمام!',
      section: 'القسم',
      sensitiveNote: 'كل حاجة بتكتبها هنا بتفضل في جهازك ومش بتتسجل على أي سيرفر خارجي.',
      zenMode: 'روقان وتركيز (Zen)',
      zenModeHint: 'شاشة قراءة هادية بدون أي مشتتات (حرف Z)',
      zenExit: 'الخروج من وضع التركيز',
      zenEsc: 'زرار ESC للخروج',
      zenFontNormal: 'خط عادي',
      zenFontBig: 'خط كبير وواضح',
      authHeading: 'منور في Syntax 👋',
      authSub: 'اعمل حسابك المجاني عشان تتابع تقدمك في كل كورس وتحفظ درجاتك في الكويزات.',
      registerTab: 'حساب جديد',
      loginTab: 'تسجيل الدخول',
      fullName: 'اسمك بالكامل',
      fullNamePh: 'مثال: أحمد محمد علي',
      username: 'اسم المستخدم',
      usernamePh: 'مثال: ahmed_dev',
      gmail: 'إيميلك (Gmail)',
      gmailPh: 'example@gmail.com',
      phone: 'رقم موبايلك',
      phonePh: '10 1234 5678',
      password: 'الباسورد',
      passwordPh: 'على الأقل 6 حروف وأرقام',
      confirmPassword: 'أكد الباسورد',
      confirmPasswordPh: 'اكتب الباسورد تاني للتأكيد',
      selectCountry: 'كود البلد',
      searchCountryPh: 'ابحث باسم البلد أو كود الاتصال...',
      streamHeading: 'حابب تدرس بأنهي طريقة؟',
      streamAr: 'عربي',
      streamEn: 'English',
      btnRegister: 'اعمل حسابك ويلا نبدأ',
      btnLogin: 'سجل دخولك',
      haveAccount: 'عندك حساب معانا بالفعل؟',
      noAccount: 'لسه معملتش حساب؟',
      goToLogin: 'سجل دخول من هنا',
      goToRegister: 'اعمل حساب جديد ببلاش',
      regSuccess: 'حسابك اتعمل بنجاح! تقدر تسجل دخولك دلوقتي وتبدأ تتعلم.',
      student: 'طالب / مبرمج',
      logout: 'تسجيل الخروج',
      accountInfo: 'بيانات حسابك',
      coursesCompleted: 'الدروس اللي خلصتها',
      lessonVideo: 'شرح الفيديو مع المستر',
      lessonVideoSub: 'اتفرج على المحاضرة الأول عشان تفهم الفكرة العامة، وبعدها انزل اقرأ الشرح وحل التمارين.',
      markVideoDone: 'خلصت الفيديو — يلا على الشرح والتمارين',
      videoWatched: 'تمام! خلصت مشاهدة الفيديو بنجاح',
      continueToText: 'كمّل مع الشرح المكتوب',
      setVideoBtn: 'تعديل رابط الفيديو',
      saveVideoBtn: 'حفظ الرابط',
      videoUrlLabel: 'رابط فيديو يوتيوب أو ملف MP4:',
      videoUrlPlaceholder: 'https://www.youtube.com/watch?v=...',
      guestSignIn: 'تصفح كزائر على السريع',
      guestSubtitle: 'ادخل اتفرج على الدروس وجرب المعامل الحية من غير تسجيل (بس مش هيحفظ تقدمك)',
      guestBadge: 'وضع الزائر',
      guestTempWarning: 'أنت دلوقتي داخل كزائر مؤقت. لو قفلت المتصفح، تقدمك في الدروس ودرجاتك في الاختبارات مش هتتحفظ.',
      guestNoSavePill: 'زائر · مؤقت',
      createAccountToSave: 'اعمل حساب عشان تحفظ تقدمك',
      exitGuest: 'اخرج من وضع الزائر',
      orDivider: 'أو'
    },
    en: {
      siteTitle: 'Syntax',
      brand: 'Syntax',
      copyrightOwner: 'AborayaTechnologies',
      coursesNav: 'Courses',
      grade: 'Universal Programming & AI Platform',
      chapter: 'Chapter',
      lesson: 'Lesson',
      lessons: 'lessons',
      min: 'min',
      gateKicker: 'Before we start',
      gateTitle: 'Choose your study language',
      gateAr: 'AR',
      gateArSub: 'Full curriculum in Arabic',
      gateEn: 'EN',
      gateEnSub: 'English content + Arabic translation companion',
      switchTo: 'AR',
      heroKicker: '',
      heroTitle: ['Master', 'code', 'and', 'build', 'the', 'future.'],
      heroSub: 'An open interactive learning platform for everyone to master every field of programming, web engineering, cybersecurity, and artificial intelligence through live labs, worked problems, and quizzes.',
      heroCta: 'Explore Courses',
      scrollHint: 'Scroll',
      stats: ['learning tracks', 'interactive lessons', 'practice questions'],
      manifesto: 'Every course and lesson here is built to be explored: move, tap, flip, experiment in live labs, then test yourself. No static pages, and no memorising without deep understanding.',
      chaptersKicker: 'Course Modules',
      chaptersTitle: 'Four modules, one complete journey',
      coursesKicker: 'Course Catalog',
      coursesTitle: 'Programming & AI Learning Tracks',
      coursesSub: 'Select a course below to explore interactive lessons, live coding sandboxes, and hands-on assessments.',
      openCourse: 'Open Course',
      backToCourses: 'Back to Courses',
      allChapters: 'All 4 Course Chapters',
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
      backChapter: 'Back to course',
      msgHigh: 'Excellent. You clearly understood this lesson.',
      msgMid: 'Good. Review the points you missed and try again.',
      msgLow: 'No worries. Go back through the explanation and retry.',
      loading: 'Loading…',
      prepTitle: 'This lesson is being prepared',
      prepText: 'It will appear here soon.',
      error: 'Could not load the lesson. Please try again.',
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
      authHeading: 'Welcome to Syntax',
      authSub: 'Create a free account to learn programming, track your course progress, and save your quiz scores.',
      registerTab: 'Create Account',
      loginTab: 'Sign In',
      fullName: 'Full Name',
      fullNamePh: 'e.g. Ahmed Mohamed',
      username: 'Username',
      usernamePh: 'e.g. ahmed_dev',
      gmail: 'Gmail Address',
      gmailPh: 'example@gmail.com',
      phone: 'Phone Number',
      phonePh: '10 1234 5678',
      password: 'Password',
      passwordPh: 'Minimum 6 characters (letters & numbers)',
      confirmPassword: 'Confirm Password',
      confirmPasswordPh: 'Re-enter your password',
      selectCountry: 'Select Country',
      searchCountryPh: 'Search country or dial code...',
      streamHeading: 'Preferred Study Language:',
      streamAr: 'AR',
      streamEn: 'EN',
      btnRegister: 'Create Account & Start Learning',
      btnLogin: 'Sign In',
      haveAccount: 'Already have an account?',
      noAccount: 'Don’t have an account?',
      goToLogin: 'Sign in here',
      goToRegister: 'Create a free account',
      regSuccess: 'Account created successfully! Please sign in with your credentials.',
      student: 'Learner',
      logout: 'Sign Out',
      accountInfo: 'Learner Profile',
      coursesCompleted: 'Completed Lessons',
      lessonVideo: 'Lesson Video Lecture',
      lessonVideoSub: 'Watch the video lecture before diving into the detailed lesson content and quizzes.',
      markVideoDone: 'Finished Video — Jump to Reading',
      videoWatched: 'Lecture video completed',
      continueToText: 'Continue to Lesson Content',
      setVideoBtn: 'Set Video URL',
      saveVideoBtn: 'Save URL',
      videoUrlLabel: 'YouTube URL or direct MP4 video link:',
      videoUrlPlaceholder: 'https://www.youtube.com/watch?v=...',
      guestSignIn: 'Continue as Guest',
      guestSubtitle: 'Browse courses and labs freely without saving progress',
      guestBadge: 'Guest Mode',
      guestTempWarning: 'You are browsing as a temporary guest. Completed lessons and quiz scores are not saved after closing the browser.',
      guestNoSavePill: 'Temporary · Not Saved',
      createAccountToSave: 'Create Account to Save Progress',
      exitGuest: 'Exit Guest Mode',
      orDivider: 'OR'
    }
  };

  /* ---------- countries database for phone country picker ---------- */
  const COUNTRIES = [
    { code: 'EG', dial: '+20', name: 'Egypt', ar: 'مصر' },
    { code: 'SA', dial: '+966', name: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    { code: 'AE', dial: '+971', name: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    { code: 'KW', dial: '+965', name: 'Kuwait', ar: 'الكويت' },
    { code: 'QA', dial: '+974', name: 'Qatar', ar: 'قطر' },
    { code: 'OM', dial: '+968', name: 'Oman', ar: 'سلطنة عُمان' },
    { code: 'BH', dial: '+973', name: 'Bahrain', ar: 'البحرين' },
    { code: 'JO', dial: '+962', name: 'Jordan', ar: 'الأردن' },
    { code: 'IQ', dial: '+964', name: 'Iraq', ar: 'العراق' },
    { code: 'PS', dial: '+970', name: 'Palestine', ar: 'فلسطين' },
    { code: 'LB', dial: '+961', name: 'Lebanon', ar: 'لبنان' },
    { code: 'SY', dial: '+963', name: 'Syria', ar: 'سوريا' },
    { code: 'YE', dial: '+967', name: 'Yemen', ar: 'اليمن' },
    { code: 'LY', dial: '+218', name: 'Libya', ar: 'ليبيا' },
    { code: 'SD', dial: '+249', name: 'Sudan', ar: 'السودان' },
    { code: 'MA', dial: '+212', name: 'Morocco', ar: 'المغرب' },
    { code: 'DZ', dial: '+213', name: 'Algeria', ar: 'الجزائر' },
    { code: 'TN', dial: '+216', name: 'Tunisia', ar: 'تونس' },
    { code: 'MR', dial: '+222', name: 'Mauritania', ar: 'موريتانيا' },
    { code: 'US', dial: '+1', name: 'United States', ar: 'الولايات المتحدة' },
    { code: 'GB', dial: '+44', name: 'United Kingdom', ar: 'المملكة المتحدة' },
    { code: 'CA', dial: '+1', name: 'Canada', ar: 'كندا' },
    { code: 'DE', dial: '+49', name: 'Germany', ar: 'ألمانيا' },
    { code: 'FR', dial: '+33', name: 'France', ar: 'فرنسا' },
    { code: 'TR', dial: '+90', name: 'Turkey', ar: 'تركيا' },
    { code: 'IT', dial: '+39', name: 'Italy', ar: 'إيطاليا' },
    { code: 'ES', dial: '+34', name: 'Spain', ar: 'إسبانيا' },
    { code: 'SE', dial: '+46', name: 'Sweden', ar: 'السويد' },
    { code: 'NL', dial: '+31', name: 'Netherlands', ar: 'هولندا' },
    { code: 'CH', dial: '+41', name: 'Switzerland', ar: 'سويسرا' },
    { code: 'MY', dial: '+60', name: 'Malaysia', ar: 'ماليزيا' },
    { code: 'IN', dial: '+91', name: 'India', ar: 'الهند' }
  ];

  /* ---------- auth & multi-user session state ---------- */
  const AUTH_USER_KEY = 'mabook:auth:user';
  const AUTH_GUEST_KEY = 'mabook:auth:guest';
  const AUTH_USERS_KEY = 'mabook:auth:users';
  const PREFS_KEY = 'mabook:v1';

  const getPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (e) { return {}; } };
  const savePrefs = (patch) => {
    try {
      const cur = getPrefs();
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...cur, ...patch }));
    } catch (e) {}
  };

  const getLocalUsers = () => { try { return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {}; } catch (e) { return {}; } };
  const saveLocalUsers = (u) => { try { localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(u)); } catch (e) {} };
  const getStoredUser = () => {
    try {
      const reg = JSON.parse(localStorage.getItem(AUTH_USER_KEY));
      if (reg) return reg;
      const guest = JSON.parse(sessionStorage.getItem(AUTH_GUEST_KEY));
      if (guest) return guest;
      return null;
    } catch (e) { return null; }
  };

  const Auth = {
    user: getStoredUser(),
    subs: new Set(),
    getUser() { return Auth.user; },
    subscribe(fn) { Auth.subs.add(fn); return () => Auth.subs.delete(fn); },
    notify() { Auth.subs.forEach(fn => fn(Auth.user)); },

    async register(data, uiLang) {
      const isAr = (uiLang || data.stream || 'ar') === 'ar';
      const cleanUser = String(data.username || '').trim().toLowerCase();
      const cleanGmail = String(data.gmail || '').trim().toLowerCase();
      const cleanPhone = String(data.phone || '').replace(/\D/g, '');
      const pass = String(data.password || '');

      if (!cleanUser || !/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
        return { error: isAr ? 'يجب أن يتكوّن اسم المستخدم من 3 إلى 20 حرفًا إنجليزيًا أو رقمًا أو شرطة سفلية (_)' : 'Username must be 3-20 characters of letters, numbers, or underscores' };
      }
      if (!cleanGmail || !cleanGmail.endsWith('@gmail.com') || cleanGmail.length < 12) {
        return { error: isAr ? 'يُرجى إدخال بريد Gmail صحيح ينتهي بـ @gmail.com' : 'A valid Gmail address (@gmail.com) is required' };
      }
      if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 15) {
        return { error: isAr ? 'يُرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number' };
      }
      if (pass.length < 6 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
        return { error: isAr ? 'يجب أن تتكوّن كلمة المرور من 6 خانات على الأقل وتحتوي على حروف وأرقام' : 'Password must be at least 6 characters with letters and numbers' };
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, username: cleanUser, gmail: cleanGmail, phone: cleanPhone, lang: isAr ? 'ar' : 'en' })
        });
        const resData = await res.json();
        if (!res.ok) return { error: resData.error || (isAr ? 'تعذّر إنشاء الحساب، يُرجى المحاولة مرة أخرى' : 'Registration failed') };
      } catch (e) {
        const local = getLocalUsers();
        if (local[cleanUser]) return { error: isAr ? 'اسم المستخدم هذا مسجّل بالفعل، يُرجى اختيار اسم آخر' : 'Username is already registered' };
        for (const k in local) {
          if (local[k].gmail === cleanGmail) return { error: isAr ? 'هذا البريد الإلكتروني (Gmail) مسجّل بالفعل' : 'This Gmail address is already registered' };
        }
        local[cleanUser] = {
          username: cleanUser,
          name: String(data.name || cleanUser).trim(),
          gmail: cleanGmail,
          countryCode: data.countryCode || '+20',
          phone: cleanPhone,
          password: pass,
          stream: data.stream === 'en' ? 'en' : 'ar',
          registeredAt: new Date().toISOString()
        };
        saveLocalUsers(local);
      }
      return { ok: true, username: cleanUser };
    },

    async login(loginInput, password, uiLang) {
      const isAr = (uiLang || 'ar') === 'ar';
      const cleanLogin = String(loginInput || '').trim().toLowerCase();
      if (!cleanLogin || !password) {
        return { error: isAr ? 'يُرجى إدخال اسم المستخدم (أو البريد الإلكتروني) وكلمة المرور' : 'Please enter your username/Gmail and password' };
      }

      let user = null;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: cleanLogin, password, lang: isAr ? 'ar' : 'en' })
        });
        const resData = await res.json();
        if (res.ok && resData.user) {
          user = resData.user;
        } else if (!res.ok) {
          return { error: resData.error || (isAr ? 'بيانات تسجيل الدخول غير صحيحة' : 'Invalid login credentials') };
        }
      } catch (e) {
        const local = getLocalUsers();
        let found = local[cleanLogin];
        if (!found) {
          for (const u in local) {
            if (local[u].gmail === cleanLogin) { found = local[u]; break; }
          }
        }
        if (found && found.password === String(password)) {
          const { password: _, ...safe } = found;
          user = safe;
        } else {
          return { error: isAr ? 'اسم المستخدم (أو البريد الإلكتروني) أو كلمة المرور غير صحيحة' : 'Invalid username/Gmail or password' };
        }
      }

      if (user) {
        Auth.user = user;
        try { sessionStorage.removeItem(AUTH_GUEST_KEY); } catch (e) {}
        try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)); } catch (e) {}
        Store.loadUser(user.username);
        Store.set({ lang: user.stream || 'ar' });
        Auth.notify();
        return { ok: true, user };
      }
      return { error: isAr ? 'تعذّر تسجيل الدخول' : 'Sign in failed' };
    },

    loginAsGuest(stream = 'ar') {
      const cleanStream = stream === 'en' ? 'en' : 'ar';
      const guest = {
        isGuest: true,
        username: 'guest',
        name: cleanStream === 'en' ? 'Guest' : 'زائر',
        gmail: 'guest@session',
        phone: '—',
        countryCode: '+20',
        stream: cleanStream
      };
      Auth.user = guest;
      try { sessionStorage.setItem(AUTH_GUEST_KEY, JSON.stringify(guest)); } catch (e) {}
      Store.activeUser = 'guest';
      const prefs = getPrefs();
      Store.data = { ...prefs, lang: cleanStream, lessons: {} };
      savePrefs({ lang: cleanStream });
      Store.subs.forEach(fn => fn(Store.data));
      Auth.notify();
      return { ok: true, user: guest };
    },

    logout() {
      Auth.user = null;
      try { localStorage.removeItem(AUTH_USER_KEY); } catch (e) {}
      try { sessionStorage.removeItem(AUTH_GUEST_KEY); } catch (e) {}
      Store.loadUser('guest');
      Auth.notify();
    }
  };

  function useAuth() {
    const [u, setU] = useState(Auth.user);
    useEffect(() => Auth.subscribe(setU), []);
    return u;
  }

  /* ---------- per-account isolated progress store ---------- */
  const getUserKey = (uname) => 'mabook:user:' + (uname || (Auth.user ? Auth.user.username : 'guest'));
  const readUserStore = (uname) => {
    const prefs = getPrefs();
    if (!uname || uname === 'guest') {
      const guestStream = Auth.user && Auth.user.isGuest ? Auth.user.stream : undefined;
      return { ...prefs, lang: guestStream || prefs.lang || 'ar', lessons: {} };
    }
    try {
      const saved = JSON.parse(localStorage.getItem(getUserKey(uname))) || {};
      return { ...prefs, ...saved, lessons: saved.lessons || {} };
    } catch (e) {
      return { ...prefs, lessons: {} };
    }
  };

  const Store = {
    activeUser: (Auth.user && !Auth.user.isGuest) ? Auth.user.username : 'guest',
    data: readUserStore((Auth.user && !Auth.user.isGuest) ? Auth.user.username : 'guest'),
    subs: new Set(),
    loadUser(username) {
      Store.activeUser = username || 'guest';
      const isGuest = Store.activeUser === 'guest' || (Auth.user && Auth.user.isGuest);
      const prefs = getPrefs();
      if (isGuest) {
        const guestStream = Auth.user && Auth.user.isGuest ? Auth.user.stream : prefs.lang;
        Store.data = { ...prefs, lang: guestStream || 'ar', lessons: {} };
        Store.subs.forEach(fn => fn(Store.data));
        return;
      }
      Store.data = readUserStore(Store.activeUser);
      if (username && username !== 'guest') {
        fetch('/api/user/progress/' + encodeURIComponent(username))
          .then(r => r.ok ? r.json() : null)
          .then(res => {
            if (res && res.progress && res.progress.lessons) {
              Store.data = { ...Store.data, lessons: { ...(Store.data.lessons || {}), ...res.progress.lessons } };
              try { localStorage.setItem(getUserKey(Store.activeUser), JSON.stringify(Store.data)); } catch (e) {}
              Store.subs.forEach(fn => fn(Store.data));
            }
          })
          .catch(() => {});
      }
      Store.subs.forEach(fn => fn(Store.data));
    },
    set(patch) {
      Store.data = { ...Store.data, ...patch };
      if (patch.theme !== undefined || patch.lang !== undefined || patch.bilingual !== undefined) {
        const prefPatch = {};
        if (patch.theme !== undefined) prefPatch.theme = patch.theme;
        if (patch.lang !== undefined) prefPatch.lang = patch.lang;
        if (patch.bilingual !== undefined) prefPatch.bilingual = patch.bilingual;
        savePrefs(prefPatch);
      }
      if (Auth.user && Auth.user.isGuest && patch.lang) {
        Auth.user = { ...Auth.user, stream: patch.lang };
        try { sessionStorage.setItem(AUTH_GUEST_KEY, JSON.stringify(Auth.user)); } catch (e) {}
      }
      const isGuest = Store.activeUser === 'guest' || (Auth.user && Auth.user.isGuest);
      if (!isGuest) {
        try { localStorage.setItem(getUserKey(Store.activeUser), JSON.stringify(Store.data)); } catch (e) {}
        if (Auth.user && Auth.user.username && patch.lessons) {
          fetch('/api/user/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: Auth.user.username, progress: { lessons: Store.data.lessons } })
          }).catch(() => {});
        }
      }
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

  /* ---------- lesson video player store ---------- */
  const VIDEOS_KEY = 'mabook:videos';
  const getLocalVideos = () => { try { return JSON.parse(localStorage.getItem(VIDEOS_KEY)) || {}; } catch (e) { return {}; } };
  const StoreVideos = {
    data: { '1-1': 'https://www.youtube.com/watch?v=RPgWgZrSfQc', ...getLocalVideos() },
    subs: new Set(),
    subscribe(fn) { StoreVideos.subs.add(fn); return () => StoreVideos.subs.delete(fn); },
    async init() {
      try {
        let res = await fetch('/api/lesson/videos');
        if (!res.ok) res = await fetch('./data/videos.json');
        if (res.ok) {
          const v = await res.json();
          StoreVideos.data = { ...StoreVideos.data, ...v };
          try { localStorage.setItem(VIDEOS_KEY, JSON.stringify(StoreVideos.data)); } catch (e) {}
          StoreVideos.subs.forEach(fn => fn(StoreVideos.data));
        }
      } catch (e) {}
    },
    get(lessonId) {
      return StoreVideos.data[lessonId] || '';
    },
    async set(lessonId, url) {
      StoreVideos.data = { ...StoreVideos.data, [lessonId]: String(url || '').trim() };
      try { localStorage.setItem(VIDEOS_KEY, JSON.stringify(StoreVideos.data)); } catch (e) {}
      StoreVideos.subs.forEach(fn => fn(StoreVideos.data));
      try {
        await fetch('/api/lesson/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, videoUrl: url })
        });
      } catch (e) {}
    }
  };
  StoreVideos.init();

  /* ---------- language context ---------- */
  const LangCtx = createContext({ lang: 'ar', t: STR.ar, dir: 'rtl' });
  const useLang = () => useContext(LangCtx);

  /* ---------- fetch with cache & static fallback ---------- */
  const cache = new Map();
  const ALL_LESSON_IDS = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3', '4-1', '4-2', '4-3', '4-4'];

  function mapStaticFallbackUrl(url) {
    if (url === '/api/meta') return './data/meta.json';
    const m = url.match(/^\/api\/lesson\/(ar|en)\/(\d-\d)$/);
    if (m) return `./data/lessons/${m[1]}/${m[2]}.json`;
    return null;
  }

  function getJSON(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then(r => {
        if (!r.ok) { const e = new Error(String(r.status)); e.status = r.status; throw e; }
        return r.json();
      }).catch(async e => {
        if (url === '/api/status') {
          return { ar: ALL_LESSON_IDS, en: ALL_LESSON_IDS, questions: { ar: 171, en: 171 } };
        }
        const fallback = mapStaticFallbackUrl(url);
        if (fallback) {
          try {
            const r2 = await fetch(fallback);
            if (r2.ok) return await r2.json();
          } catch (e2) {}
        }
        cache.delete(url);
        throw e;
      }));
    }
    return cache.get(url);
  }

  /* ---------- smooth scroll (Lenis driven by GSAP ticker) ---------- */
  let lenis = null;
  function initSmoothScroll() {
    if (reduced || lenis || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, autoResize: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToY(y, immediate) {
    if (lenis) {
      if (lenis.resize) lenis.resize();
      lenis.scrollTo(y, { immediate: !!immediate, duration: 1.2, easing: x => 1 - Math.pow(1 - x, 4) });
    } else {
      window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
    }
  }
  function scrollToEl(el, offset) {
    if (!el) return;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - (offset || 0));
  }
  const getLenis = () => lenis;

  /* ---------- scroll reveal engine ---------- */
  const made = [];
  let refreshTimer = 0;
  function scan(root) {
    if (reduced) return;
    const scope = root || document;
    const isRtl = document.documentElement.dir === 'rtl';

    scope.querySelectorAll('[data-reveal]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const kind = el.dataset.reveal;
      const from = kind === 'fade'
        ? { opacity: 0 }
        : kind === 'left'
          ? { opacity: 0, x: isRtl ? 40 : -40 }
          : kind === 'scale'
            ? { opacity: 0, scale: .94 }
            : { opacity: 0, y: 36 };
      const tw = gsap.fromTo(el, from, {
        opacity: 1, x: 0, y: 0, scale: 1, duration: .9, ease: 'power3.out',
        delay: +(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 96%', once: true }
      });
      made.push(tw);
    });
    scope.querySelectorAll('[data-stagger]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const kids = Array.from(el.children);
      if (!kids.length) return;
      const tw = gsap.fromTo(kids, { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: .85, ease: 'power3.out', stagger: .08,
        scrollTrigger: { trigger: el, start: 'top 96%', once: true }
      });
      made.push(tw);
    });
    scope.querySelectorAll('[data-words]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const words = el.querySelectorAll('.wi');
      if (!words.length) return;
      const tw = gsap.fromTo(words, { yPercent: 115 }, {
        yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: .06,
        delay: +(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 96%', once: true }
      });
      made.push(tw);
    });
    scope.querySelectorAll('[data-scrub-words]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const words = el.querySelectorAll('.sw');
      if (!words.length) return;
      const tw = gsap.fromTo(words, { opacity: .18 }, {
        opacity: 1, ease: 'none', stagger: .1,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: true }
      });
      made.push(tw);
    });
    scope.querySelectorAll('[data-draw]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const fill = el.querySelector('.tl-fill');
      if (!fill) return;
      const tw = gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 60%', scrub: true }
      });
      made.push(tw);
    });
    scope.querySelectorAll('[data-parallax]:not([data-r])').forEach(el => {
      el.dataset.r = '1';
      const amt = +el.dataset.parallax;
      const tw = gsap.fromTo(el, { y: -amt }, {
        y: amt, ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      made.push(tw);
    });
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (lenis && lenis.resize) lenis.resize();
      ScrollTrigger.refresh();
    }, 180);
  }

  function killAll() {
    while (made.length) {
      const tw = made.pop();
      const targets = tw.targets ? tw.targets() : [];
      if (tw.scrollTrigger) tw.scrollTrigger.kill();
      tw.kill();
      if (targets.length) {
        try { gsap.set(targets, { clearProps: 'opacity,transform,translate,rotate,scale' }); } catch (e) {}
      }
    }
    document.querySelectorAll('[data-r]').forEach(el => {
      delete el.dataset.r;
    });
  }

  function useScan() {
    useEffect(() => {
      const id = requestAnimationFrame(() => scan());
      return () => cancelAnimationFrame(id);
    });
  }

  /* ---------- tiny components ---------- */
  function Words({ text, tag, className, delay }) {
    const T = tag || 'span';
    const arr = Array.isArray(text) ? text : String(text || '').split(/\s+/).filter(Boolean);
    return h(T, { className: 'words ' + (className || ''), 'data-words': '', 'data-delay': delay || 0, 'aria-label': arr.join(' ') },
      arr.map((w, i) =>
        h(React.Fragment, { key: i },
          h('span', { className: 'w', 'aria-hidden': 'true' }, h('span', { className: 'wi' }, w)),
          i < arr.length - 1 ? ' ' : null)));
  }

  function ScrubWords({ text, className }) {
    const arr = String(text || '').split(/\s+/).filter(Boolean);
    return h('p', { className: 'scrub ' + (className || ''), 'data-scrub-words': '' },
      arr.map((w, i) => h(React.Fragment, { key: i }, h('span', { className: 'sw' }, w), i < arr.length - 1 ? ' ' : null)));
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
              u.lang = arVoice.lang || 'ar-EG';
            } else {
              u.lang = 'ar-EG';
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
          };
          u.onend = () => {
            clearInterval(TTS._ping);
            TTS.speaking = false;
            TTS.paused = false;
            TTS.currentId = null;
            TTS.currentText = '';
            TTS.notify();
          };
          u.onerror = () => {
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
    // Courses
    { type: 'lesson', id: '1-1', target: '#/course/baccalaureate', title: 'Programming & AI Complete Course (Baccalaureate)', titleAr: 'كورس البرمجة والذكاء الاصطناعي المتكامل (البكالوريا)', ch: 1, keywords: 'course baccalaureate programming ai full track كورس البكالوريا البرمجة والذكاء الاصطناعي مسار شامل' },
    { type: 'lesson', id: '3-1', target: '#/course/web', title: 'Web Engineering & Front-End Development Track', titleAr: 'كورس هندسة وتطوير الويب المتكامل (Web & UX)', ch: 3, keywords: 'course web html css javascript http ux ui كورس تطوير الويب واجهات المستخدم' },
    { type: 'lesson', id: '1-2', target: '#/course/ai', title: 'Artificial Intelligence & Machine Learning Track', titleAr: 'كورس الذكاء الاصطناعي وتعلّم الآلة (AI & ML)', ch: 1, keywords: 'course ai machine learning deep learning neural networks كورس الذكاء الاصطناعي تعلم الآلة' },
    { type: 'lesson', id: '2-1', target: '#/course/cyber', title: 'Cybersecurity & Network Defense Track', titleAr: 'كورس الأمن السيبراني وحماية الشبكات (Cybersecurity)', ch: 2, keywords: 'course cybersecurity encryption firewall network security كورس الأمن السيبراني التشفير الشبكات' },

    // Lessons
    { type: 'lesson', id: '1-1', title: 'The Evolution of IT and Social Transformation', titleAr: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', ch: 1, keywords: 'computer eniac moore vacuum tubes microprocessors internet cloud حاسوب إينياك صمامات مفرغة معالجات سحابية' },
    { type: 'lesson', id: '1-2', title: 'How Artificial Intelligence Works', titleAr: 'كيف يعمل الذكاء الاصطناعي', ch: 1, keywords: 'ai machine learning deep learning neural network turing mccarthy ذكاء اصطناعي تعلم آلي شبكات عصبية تورينج' },
    { type: 'lesson', id: '1-3', title: 'AI in Daily Life and Industry', titleAr: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', ch: 1, keywords: 'self driving waymo healthcare surgical robot da vinci smart factory drone طب جراحة سيارات ذاتية مصانع زراعة' },
    { type: 'lesson', id: '1-4', title: 'Ethical Issues of Artificial Intelligence', titleAr: 'القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي', ch: 1, keywords: 'bias fairness black box privacy copyright deepfake surveillance أخلاقيات تحيز خصوصية تزييف عميق مراقبة حقوق ملكية' },
    { type: 'lesson', id: '2-1', title: 'Encryption and Authentication Techniques', titleAr: 'تقنيات التشفير والمصادقة', ch: 2, keywords: 'cryptography caesar cipher symmetric asymmetric rsa passwords mfa 2fa yubikey biometrics تشفير قيصر متماثل مفتاح عام كلمة مرور مصادقة بصمة' },
    { type: 'lesson', id: '2-2', title: 'Network Security Design', titleAr: 'تصميم أمن الشبكات', ch: 2, keywords: 'firewall dmz ids ips zero trust ddos botnet wifi wpa3 جدار ناري منطقة منزوعة السلاح انعدام الثقة هجمات حجب الخدمة راوتر' },
    { type: 'lesson', id: '2-3', title: 'Incident Response and Risk Management', titleAr: 'الاستجابة للحوادث وإدارة المخاطر', ch: 2, keywords: 'soc incident nist ransomware backup 3-2-1 risk social engineering phishing طوارئ فدية نسخ احتياطي مخاطر تصيد احتيالي هندسة اجتماعية' },
    { type: 'lesson', id: '3-1', title: 'General Architecture of Web Applications', titleAr: 'البنية العامة لتطبيقات الويب', ch: 3, keywords: 'web tim berners-lee client server dns cdn url ip next submarine cables خادم عميل ألياف ضوئية سيرن' },
    { type: 'lesson', id: '3-2', title: 'Communication Methods in Web Applications', titleAr: 'طرق الاتصال في تطبيقات الويب', ch: 3, keywords: 'http https get post put delete status codes 200 404 500 rest api websocket wireshark بروتوكول طلبات استجابة واجهة برمجة' },
    { type: 'lesson', id: '3-3', title: 'Front-End Technology Basics', titleAr: 'أساسيات تكنولوجيا الواجهة الأمامية', ch: 3, keywords: 'html html5 css javascript js dom box model brendan eich hakon lie devtools تنسيق هيكل تفاعل برمجة واجهات' },
    { type: 'lesson', id: '4-1', title: 'Media Types and Their Properties', titleAr: 'أنواع الوسائط وخصائصها', ch: 4, keywords: 'raster vector bitmap svg pixels jpeg png webp mp4 lossy lossless bitrate وسائط نقطية متجهة بكسل ضغط جودة فيديو صوت' },
    { type: 'lesson', id: '4-2', title: 'Information Design and User Experience', titleAr: 'تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية', ch: 4, keywords: 'ux ui information architecture don norman affordance feedback wcag contrast accessibility wireframe إتاحة وصول تباين ألوان دلالة تجربة مستخدم واجهة' },
    { type: 'lesson', id: '4-3', title: 'Methods of Evaluating Websites', titleAr: 'طرق تقييم المواقع الإلكترونية', ch: 4, keywords: 'usability testing jakob nielsen heuristics core web vitals lcp inp cls bounce rate heatmaps a/b testing اختبار قابلية استخدام سرعة استقرار بصري خرائط حرارية' },
    { type: 'lesson', id: '4-4', title: 'Iterative Improvement of Websites', titleAr: 'عملية التحسين التكراري للمواقع الإلكترونية', ch: 4, keywords: 'iterative agile kanban user feedback regression testing ci/cd staging production seo maintenance تحسين تكراري اختبار انحدار بيئة تجربة نشر مستمر صيانة' },

    // Demos and Interactive Labs
    { type: 'demo', id: '1-1', target: '#/lesson/1-1', title: 'Moore’s Law Simulator', titleAr: 'محاكي قانون مور لمضاعفة الترانزستورات', keywords: 'moore law transistor doubling calculator 1971 2025 محاكي ترانزستور حساب' },
    { type: 'demo', id: '2-1', target: '#/lesson/2-1', title: 'Interactive Caesar Cipher Lab', titleAr: 'مختبر شفرة قيصر التفاعلي وعجلة التشفير', keywords: 'caesar shift encode decode secret wheel تشفير قيصر إزاحة فك شفرة' },
    { type: 'demo', id: '2-1', target: '#/lesson/2-1', title: 'Password Strength & Entropy Analyzer', titleAr: 'محلل قوة كلمات المرور وزمن الاختراق', keywords: 'password entropy brute force crack time قوة كلمة مرور كسر تخمين أمان' },
    { type: 'demo', id: '3-2', target: '#/lesson/3-2', title: 'Live HTTP Server Request Simulator', titleAr: 'محاكي خادم HTTP المباشر للطلبات والاستجابات', keywords: 'http request simulator get post json api محاكي طلبات خادم ردود' },
    { type: 'demo', id: '3-3', target: '#/lesson/3-3', title: 'Live HTML/CSS/JS Sandbox Playground', titleAr: 'محرر الأكواد الحي لتقنيات الويب', keywords: 'html css javascript code editor live sandbox ملعب تجربة كود برمجة مباشر' },
    { type: 'demo', id: '4-2', target: '#/lesson/4-2', title: 'WCAG Color Contrast Laboratory', titleAr: 'مختبر فحص تباين الألوان ومعايير الإتاحة', keywords: 'wcag contrast checker aa aaa accessibility ratio فاحص تباين ألوان وصول إتاحة' },

    // Real Hardware & Pioneers
    { type: 'figure', id: '1-1', target: '#/lesson/1-1', title: 'Gordon Moore & ENIAC (1945)', titleAr: 'جوردون مور وحاسوب إينياك العملاق', keywords: 'gordon moore eniac intel 4004 vacuum tubes transistors حاسوب تاريخي صمامات' },
    { type: 'figure', id: '1-2', target: '#/lesson/1-2', title: 'Alan Turing & John McCarthy', titleAr: 'آلان تورينج وجون مكارثي ورواد الذكاء الاصطناعي', keywords: 'alan turing john mccarthy turing test dartmouth علماء حاسوب اختبار ذكاء' },
    { type: 'figure', id: '1-3', target: '#/lesson/1-3', title: 'Waymo Autonomous Car & Da Vinci Robot', titleAr: 'سيارة وايمو ذاتية القيادة وروبوت دافنشي الجراحي', keywords: 'waymo self driving lidar da vinci surgical robot روبوت طبي سيارة ذكية ليدار' },
    { type: 'figure', id: '2-1', target: '#/lesson/2-1', title: 'Julius Caesar & Enigma Cipher Machine', titleAr: 'يوليوس قيصر وآلة إنجما للتشفير', keywords: 'caesar enigma machine cipher world war آلة تشفير ميكانيكية تاريخية' },
    { type: 'figure', id: '2-1', target: '#/lesson/2-1', title: 'YubiKey Hardware Key & Biometrics', titleAr: 'مفتاح الأمان المادي YubiKey وبصمة الإصبع', keywords: 'yubikey hardware 2fa usb token fingerprint scanner مفتاح أمان مادي مصادقة ثنائية' },
    { type: 'figure', id: '2-2', target: '#/lesson/2-2', title: 'Hardware Firewall & Ethernet Switch', titleAr: 'جهاز الجدار الناري وموزع الشبكة السلكية', keywords: 'hardware firewall appliance switch cisco rj45 cables جدار ناري موزع شبكة كابلات' },
    { type: 'figure', id: '2-3', target: '#/lesson/2-3', title: 'Security Operations Center (SOC) & NAS', titleAr: 'مركز العمليات الأمنية SOC ووحدات النسخ الاحتياطي NAS', keywords: 'security operations center soc nas backup monitors غرفة مراقبة أمنية نسخ احتياطي' },
    { type: 'figure', id: '3-1', target: '#/lesson/3-1', title: 'Sir Tim Berners-Lee & NeXT Web Server', titleAr: 'السير تيم بيرنرز لي وأول خادم ويب', keywords: 'tim berners-lee cern next computer first server مخترع الويب أول سيرفر' },
    { type: 'figure', id: '3-1', target: '#/lesson/3-1', title: 'Undersea Submarine Fiber-Optic Cable', titleAr: 'كابل الألياف الضوئية البحري للإنترنت', keywords: 'submarine optical cable ocean cross section كابل بحري ألياف ضوئية قاع المحيط' },
    { type: 'figure', id: '3-3', target: '#/lesson/3-3', title: 'Brendan Eich (JS) & Håkon Wium Lie (CSS)', titleAr: 'بريندان آيك (مبتكر JS) وهاكون لي (مبتكر CSS)', keywords: 'brendan eich javascript hakon wium lie css web devtools مبتكر جافاسكريبت مصمم' },
    { type: 'figure', id: '4-2', target: '#/lesson/4-2', title: 'Don Norman & Refreshable Braille Display', titleAr: 'دون نورمان وجهاز سطر برايل للمكفوفين', keywords: 'don norman everyday things braille display accessibility مكفوفين سطر برايل رائد تجربة' },
    { type: 'figure', id: '4-3', target: '#/lesson/4-3', title: 'Jakob Nielsen & Eye-Tracking Usability Lab', titleAr: 'ياكوب نيلسن وأجهزة تتبع حركة العين', keywords: 'jakob nielsen usability eye tracking glasses heatmaps خبير قابلية استخدام تتبع النظر' },

    // Key Terms & Concepts
    { type: 'term', id: '2-1', target: '#/lesson/2-1', title: 'Zero Trust Architecture', titleAr: 'بنية انعدام الثقة (Zero Trust)', keywords: 'never trust always verify perimeter security أمان تحقق دائم شبكات' },
    { type: 'term', id: '2-2', target: '#/lesson/2-2', title: 'DDoS Attack & Botnets', titleAr: 'هجمات حجب الخدمة الموزعة وشبكات البوت نت', keywords: 'distributed denial of service botnet zombie nodes هجوم تعطيل سيرفر حجب' },
    { type: 'term', id: '3-2', target: '#/lesson/3-2', title: 'REST APIs & WebSockets', titleAr: 'واجهات برمجة التطبيقات REST وبروتوكول WebSockets', keywords: 'rest api json stateless websocket real time اتصال تطبيقات سحابية فوري' },
    { type: 'term', id: '4-2', target: '#/lesson/4-2', title: 'Affordance & Feedback Principles', titleAr: 'مبادئ الدلالة (Affordance) والتغذية الراجعة', keywords: 'affordance feedback don norman clickable buttons دلالة استجابة تفاعل فوري' },
    { type: 'term', id: '4-3', target: '#/lesson/4-3', title: 'Google Core Web Vitals (LCP, INP, CLS)', titleAr: 'معايير أداء الويب الحيوية (Core Web Vitals)', keywords: 'lcp largest contentful paint inp interactivity cls cumulative layout shift سرعة تحميل استقرار بصري' },
    { type: 'term', id: '4-4', target: '#/lesson/4-4', title: 'Regression Testing & CI/CD Pipelines', titleAr: 'اختبار الانحدار وخطوط النشر المستمر (CI/CD)', keywords: 'regression testing automated tests staging production ci cd فحص أخطاء بيئة تجربة نشر' }
  ];

  function search(query) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return SEARCH_ITEMS.filter(it => {
      const corpus = (it.title + ' ' + (it.titleAr || '') + ' ' + (it.keywords || '') + ' ' + it.type).toLowerCase();
      return tokens.every(tok => corpus.includes(tok));
    }).slice(0, 12);
  }

  /* ---------- site texts remote synchronization ---------- */
  const TEXTS_LOCAL_KEY = 'syntax:texts:v2';
  const textListeners = new Set();
  const notifyTextChange = () => textListeners.forEach(fn => fn(STR));
  const subscribeTexts = (fn) => { textListeners.add(fn); return () => textListeners.delete(fn); };

  async function loadSiteTexts() {
    try {
      const localCustom = JSON.parse(localStorage.getItem(TEXTS_LOCAL_KEY) || 'null');
      if (localCustom) {
        if (localCustom.ar) Object.assign(STR.ar, localCustom.ar);
        if (localCustom.en) Object.assign(STR.en, localCustom.en);
      }
    } catch (e) {}
    try {
      let res = await fetch('/api/site/texts');
      if (res.ok) {
        const data = await res.json();
        if (data && data.texts) {
          if (data.texts.ar) Object.assign(STR.ar, data.texts.ar);
          if (data.texts.en) Object.assign(STR.en, data.texts.en);
          notifyTextChange();
          return data.texts;
        }
      } else {
        const res2 = await fetch('./data/texts.json');
        if (res2.ok) {
          const texts = await res2.json();
          if (texts.ar) Object.assign(STR.ar, texts.ar);
          if (texts.en) Object.assign(STR.en, texts.en);
          notifyTextChange();
          return texts;
        }
      }
    } catch (e) {}
    return null;
  }

  async function saveSiteTexts(updatedTexts) {
    if (updatedTexts.ar) Object.assign(STR.ar, updatedTexts.ar);
    if (updatedTexts.en) Object.assign(STR.en, updatedTexts.en);
    try {
      localStorage.setItem(TEXTS_LOCAL_KEY, JSON.stringify({ ar: STR.ar, en: STR.en }));
    } catch (e) {}
    notifyTextChange();

    try {
      const res = await fetch('/api/site/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTexts)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.texts) {
          if (data.texts.ar) Object.assign(STR.ar, data.texts.ar);
          if (data.texts.en) Object.assign(STR.en, data.texts.en);
          notifyTextChange();
          return { ok: true, texts: data.texts };
        }
      }
    } catch (e) {
      return { ok: true, texts: { ar: STR.ar, en: STR.en } };
    }
    return { ok: true, texts: { ar: STR.ar, en: STR.en } };
  }

  loadSiteTexts();

  window.App = {
    h, STR, Store, useStore, LangCtx, useLang, getJSON, initSmoothScroll, scrollToY, scrollToEl, getLenis,
    scan, killAll, useScan, Words, ScrubWords, reduced, TTS, search, SEARCH_ITEMS,
    Auth, useAuth, COUNTRIES, StoreVideos,
    loadSiteTexts, saveSiteTexts, subscribeTexts
  };
})();
