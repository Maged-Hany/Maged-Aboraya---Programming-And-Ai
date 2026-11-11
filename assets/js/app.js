/* app.js — routing, pages, animations, courses catalog, and bilingual English+Arabic support */
(function () {
  const { h, STR, Store, useStore, LangCtx, useLang, getJSON, scrollToEl, scrollToY, getLenis, scan, killAll, useScan, Words, ScrubWords } = App;
  const { useState, useEffect, useRef, useMemo } = React;
  const pad = n => String(n).padStart(2, '0');
  const lt = (obj, lang) => obj[lang] || obj.en;

  /* ============ SVG Icons ============ */
  const SearchIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('circle', { cx: 11, cy: 11, r: 8 }),
    h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }));

  const SunIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('circle', { cx: 12, cy: 12, r: 5 }),
    h('line', { x1: 12, y1: 1, x2: 12, y2: 3 }),
    h('line', { x1: 12, y1: 21, x2: 12, y2: 23 }),
    h('line', { x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 }),
    h('line', { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 }),
    h('line', { x1: 1, y1: 12, x2: 3, y2: 12 }),
    h('line', { x1: 21, y1: 12, x2: 23, y2: 12 }),
    h('line', { x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 }),
    h('line', { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 }));

  const MoonIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }));

  const SwitchSunSvg = () => h('svg', { className: 'ts-icon ts-sun', viewBox: '0 0 24 24', fill: 'none' },
    h('circle', { cx: 12, cy: 12, r: 4.6, fill: 'currentColor' }),
    h('line', { x1: 12, y1: 2.2, x2: 12, y2: 4.6, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 12, y1: 19.4, x2: 12, y2: 21.8, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 2.2, y1: 12, x2: 4.6, y2: 12, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 19.4, y1: 12, x2: 21.8, y2: 12, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 5.07, y1: 5.07, x2: 6.77, y2: 6.77, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 17.23, y1: 17.23, x2: 18.93, y2: 18.93, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 18.93, y1: 5.07, x2: 17.23, y2: 6.77, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }),
    h('line', { x1: 6.77, y1: 17.23, x2: 5.07, y2: 18.93, stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }));

  const SwitchMoonStarSvg = () => h('svg', { className: 'ts-icon ts-moon', viewBox: '0 0 24 24', fill: 'none' },
    h('path', {
      d: 'M14.5 18.2c-4.2 0-7.6-3.4-7.6-7.6 0-2.9 1.6-5.4 4.1-6.7.4-.2.1-.8-.3-.7-4.5.7-7.9 4.6-7.9 9.3 0 5.2 4.2 9.4 9.4 9.4 4.1 0 7.6-2.6 8.9-6.3.2-.4-.4-.8-.7-.5-1.5 2-3.6 3.1-5.9 3.1z',
      fill: 'currentColor'
    }),
    h('path', {
      d: 'M17.5 3.2l.85 2.15 2.15.85-2.15.85-.85 2.15-.85-2.15-2.15-.85 2.15-.85.85-2.15z',
      fill: 'currentColor',
      stroke: 'currentColor',
      strokeWidth: 0.6,
      strokeLinejoin: 'round'
    }));


  const StarIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor', style: { display: 'inline-block', verticalAlign: 'middle' } },
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }));

  const PlayIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'currentColor' },
    h('polygon', { points: '5 3 19 12 5 21 5 3' }));

  const PauseIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'currentColor' },
    h('rect', { x: '6', y: '4', width: '4', height: '16' }),
    h('rect', { x: '14', y: '4', width: '4', height: '16' }));

  const StopIcon = () => h('svg', { width: 11, height: 11, viewBox: '0 0 24 24', fill: 'currentColor' },
    h('rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }));

  const VolumeIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
    h('path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' }));


  const CloseIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
    h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }));

  const CheckIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('polyline', { points: '20 6 9 17 4 12' }));

  const UserIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: 12, cy: 7, r: 4 }));

  const LogoutIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
    h('polyline', { points: '16 17 21 12 16 7' }),
    h('line', { x1: 21, y1: 12, x2: 9, y2: 12 }));

  const EditIcon = () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }));

  const LockIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }),
    h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }));

  const MailIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' }));

  const LayersIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }),
    h('polyline', { points: '2 17 12 22 22 17' }),
    h('polyline', { points: '2 12 12 17 22 12' }));

  const GlobeIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('line', { x1: 2, y1: 12, x2: 22, y2: 12 }),
    h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }));

  const EyeIcon = ({ off }) => off
    ? h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
      h('line', { x1: 1, y1: 1, x2: 23, y2: 23 }))
    : h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
      h('circle', { cx: 12, cy: 12, r: 3 }));

  const InstagramIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('rect', { x: 2, y: 2, width: 20, height: 20, rx: 5, ry: 5 }),
    h('path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }),
    h('line', { x1: 17.5, y1: 6.5, x2: 17.51, y2: 6.5 }));

  const FacebookIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' }));

  const GithubIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('path', { d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' }));

  const ArrowUpRightIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('line', { x1: 7, y1: 17, x2: 17, y2: 7 }),
    h('polyline', { points: '7 7 17 7 17 17' }));

  const SOCIAL_LINKS = [
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@magedinsta2',
      href: 'https://www.instagram.com/magedinsta2/',
      icon: InstagramIcon
    },
    {
      id: 'facebook',
      label: 'Facebook',
      handle: 'Maged Hany',
      href: 'https://www.facebook.com/share/1ECRubwWis/',
      icon: FacebookIcon
    },
    {
      id: 'github',
      label: 'GitHub',
      handle: 'Maged-Hany',
      href: 'https://github.com/Maged-Hany',
      icon: GithubIcon
    }
  ];

  const MAGED_FB_URL = 'https://www.facebook.com/share/1ECRubwWis/';

  function MadeByMagedBadge({ className }) {
    return h('span', { className: 'made-by-maged' + (className ? ' ' + className : ''), dir: 'ltr' },
      'Made By ',
      h('a', {
        href: MAGED_FB_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'maged-highlight',
        title: 'Maged on Facebook'
      }, 'Maged')
    );
  }

  function BrutalScrollProgress() {
    const fillRef = useRef(null);
    useEffect(() => {
      let raf = 0;
      const update = () => {
        raf = 0;
        if (!fillRef.current) return;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
        fillRef.current.style.width = pct + '%';
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }, []);
    return h('div', { className: 'brutal-scroll-rail', 'aria-hidden': 'true' },
      h('div', { className: 'brutal-scroll-fill', ref: fillRef })
    );
  }

  /* ============ Courses Catalog Definition ============ */
  const COURSES_DATA = [
    {
      id: 'students',
      featured: false,
      accent: '#2563eb',
      chapterIds: [1, 2, 3, 4],
      labsCount: 6,
      image: './assets/img/lessons/alan_turing.jpg',
      rating: '0',
      reviewsCount: '0 طالب',
      priceText: {
        ar: 'مجاني',
        en: 'Free'
      },
      tag: {
        ar: 'لطلاب البكالوريا',
        en: 'For Baccalaureate Students'
      },
      badge: {
        ar: 'لطلاب البكالوريا',
        en: 'For Baccalaureate Students'
      },
      title: {
        ar: 'كورس برمجة وذكاء اصطناعي لطلاب تانية بكالوريا',
        en: 'Programming & AI Course for 2nd Secondary Baccalaureate'
      },
      blurb: {
        ar: 'كورس البرمجة والذكاء الاصطناعي للصف الثاني الثانوي - البكالوريا. شرح مبسط لكل درس، ملازم الحصة والواجب، واجب إلكتروني وحله بالتفصيل، وكويز إلكتروني ',
        en: 'Complete Programming & Artificial Intelligence curriculum for 2nd Secondary Baccalaureate students with video explanations, study handouts, homework solutions, and timed quizzes.'
      },
      highlights: {
        ar: ['فيديوهات شرح لكل درس', 'ملازم الحصة والواجب', 'واجب الكتروني بعد كل حصة', 'كويز الكتروني بوقت بعد كل حصة'],
        en: ['Detailed Video Lectures', 'Study & Homework Handouts', 'Online Homework After Every Class', 'Timed Quizzes After Every Lesson']
      }
    }
  ];

  /* ============ country picker ============ */
  function CountryPicker({ selected, onSelect, lang }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef(null);

    useEffect(() => {
      const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      if (open) document.addEventListener('pointerdown', onDoc);
      return () => document.removeEventListener('pointerdown', onDoc);
    }, [open]);

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      if (!s) return App.COUNTRIES;
      return App.COUNTRIES.filter(c => c.code.toLowerCase().includes(s) || c.dial.includes(s) || c.name.toLowerCase().includes(s) || c.ar.includes(s));
    }, [q]);

    return h('div', { className: 'cp-wrap', ref },
      h('button', {
        type: 'button',
        className: 'cp-btn' + (open ? ' open' : ''),
        onClick: () => setOpen(!open),
        title: lang === 'ar' ? selected.ar : selected.name
      },
        h('img', {
          src: `./assets/img/flags/${selected.code.toLowerCase()}.svg`,
          alt: selected.name,
          className: 'cp-flag-img'
        }),
        h('span', { className: 'cp-dial' }, selected.dial),
        h('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, style: { transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' } },
          h('polyline', { points: '6 9 12 15 18 9' }))),
      open ? h('div', { className: 'cp-dropdown', dir: lang === 'ar' ? 'rtl' : 'ltr' },
        h('div', { className: 'cp-search' },
          h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            h('circle', { cx: 11, cy: 11, r: 8 }),
            h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })),
          h('input', {
            type: 'text',
            className: 'cp-input',
            placeholder: lang === 'ar' ? 'ابحث باسم الدولة أو مفتاح الاتصال...' : 'Search country or dial code...',
            value: q,
            autoFocus: true,
            onChange: e => setQ(e.target.value)
          })),
        h('div', { className: 'cp-list' },
          filtered.length ? filtered.map(c =>
            h('button', {
              key: c.code + c.dial,
              type: 'button',
              className: 'cp-item' + (c.code === selected.code ? ' sel' : ''),
              onClick: () => { onSelect(c); setOpen(false); setQ(''); }
            },
              h('img', {
                src: `./assets/img/flags/${c.code.toLowerCase()}.svg`,
                alt: c.name,
                className: 'cp-flag-img'
              }),
              h('span', { className: 'cp-item-name' }, lang === 'ar' ? c.ar : c.name),
              h('span', { className: 'cp-item-dial' }, c.dial)
            )
          ) : h('div', { className: 'cp-empty' }, lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No countries found')
        )
      ) : null
    );
  }

  /* ============ auth portal (register + login) ============ */
  const AUTH_PAUSED = false;

  function AuthPortal({ onAuthSuccess, onOpenTextsEditor }) {
    const [tab, setTab] = useState('register');
    const [lang, setLang] = useState('ar');
    const [tv, setTv] = useState(0);
    useEffect(() => App.subscribeTexts(() => setTv(v => v + 1)), []);
    useEffect(() => {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);
    const t = App.STR[lang];

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [gmail, setGmail] = useState('');
    const [country, setCountry] = useState(App.COUNTRIES[0]); // Egypt
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stream, setStream] = useState('ar');
    const [showPass, setShowPass] = useState(false);

    const [loginInput, setLoginInput] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
      e.preventDefault();
      if (AUTH_PAUSED) return;
      setError('');
      setSuccessMsg('');

      const cleanUser = username.trim().toLowerCase();
      const cleanGmail = gmail.trim().toLowerCase();
      const cleanPhone = phone.replace(/\D/g, '');

      if (!name.trim()) {
        setError(lang === 'ar' ? 'اكتب اسمك بالكامل عشان نسجله عندك' : 'Please enter your full name');
        return;
      }
      if (!cleanUser || !/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
        setError(lang === 'ar' ? 'اسم المستخدم لازم يكون من 3 لـ 20 حرف أو رقم إنجليزي بدون مسافات' : 'Username must be 3-20 letters, numbers, or underscores');
        return;
      }
      if (!cleanGmail || !cleanGmail.endsWith('@gmail.com') || cleanGmail.length < 12) {
        setError(lang === 'ar' ? 'اكتب إيميل Gmail مظبوط بينتهي بـ @gmail.com' : 'Valid Gmail address (@gmail.com) is required');
        return;
      }
      if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 15) {
        setError(lang === 'ar' ? 'اكتب رقم موبايل مظبوط' : 'Please enter a valid phone number');
        return;
      }
      if (password.length < 6 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        setError(lang === 'ar' ? 'الباسورد لازم يكون 6 خانات على الأقل وفيه حروف وأرقام' : 'Password must be at least 6 characters with letters and numbers');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'ar' ? 'الباسورد مش متطابق، اتأكد من كتابته تاني' : 'Passwords do not match');
        return;
      }

      setLoading(true);
      const res = await App.Auth.register({
        name: name.trim(),
        username: cleanUser,
        gmail: cleanGmail,
        countryCode: country.dial,
        phone: cleanPhone,
        password,
        stream
      }, lang);
      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(t.regSuccess);
        setLoginInput(cleanUser);
        setLoginPassword('');
        setTab('login');
      }
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      if (AUTH_PAUSED) return;
      setError('');
      setSuccessMsg('');

      if (!loginInput.trim() || !loginPassword) {
        setError(lang === 'ar' ? 'اكتب اسم المستخدم (أو الإيميل) والباسورد' : 'Please enter username/Gmail and password');
        return;
      }

      setLoading(true);
      const res = await App.Auth.login(loginInput.trim(), loginPassword, lang);
      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        onAuthSuccess(res.user);
      }
    };

    return h('div', { className: 'auth-portal-wrap', dir: lang === 'ar' ? 'rtl' : 'ltr' },
      h('div', { className: 'auth-card' },
        h('div', { className: 'auth-head' },
          h('div', { className: 'auth-brand', dir: 'ltr' },
            h('span', { className: 'brand-mark' }, h('i'), h('i'), h('i')),
            h('span', { className: 'auth-brand-name' }, t.brand || 'Syntax')),
          h('h1', { className: 'auth-title' }, t.authHeading),
          h('p', { className: 'auth-sub' }, t.authSub),
          h('div', { className: 'auth-tabs' },
            h('button', {
              type: 'button',
              className: 'auth-tab' + (tab === 'register' ? ' active' : ''),
              onClick: () => { setTab('register'); setError(''); }
            }, t.registerTab),
            h('button', {
              type: 'button',
              className: 'auth-tab' + (tab === 'login' ? ' active' : ''),
              onClick: () => { setTab('login'); setError(''); }
            }, t.loginTab)
          )
        ),
        error ? h('div', { className: 'auth-alert error' },
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, style: { flex: 'none' } },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }),
            h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })),
          h('span', null, error)
        ) : null,
        successMsg ? h('div', { className: 'auth-alert success' },
          h(CheckIcon),
          h('span', null, successMsg)
        ) : null,

        AUTH_PAUSED ? h('div', { className: 'auth-alert paused' },
          h('span', null, lang === 'ar'
            ? 'إنشاء الحساب وتسجيل الدخول متوقفين حاليًا لحد ما نجهّز قاعدة البيانات. تقدر تتصفح كزائر دلوقتي.'
            : 'Sign up and sign in are paused until the database is ready. You can browse as a guest for now.')
        ) : null,

        tab === 'register' ? h('form', { className: 'auth-form', onSubmit: handleRegister },
          h('fieldset', { className: 'auth-fieldset', disabled: AUTH_PAUSED },
          h('div', { className: 'form-group' },
            h('label', null, t.fullName),
            h('input', {
              type: 'text',
              className: 'form-input',
              placeholder: t.fullNamePh,
              value: name,
              required: true,
              autoComplete: 'name',
              onChange: e => setName(e.target.value)
            })
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.username),
            h('input', {
              type: 'text',
              className: 'form-input' + (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username) ? ' is-invalid' : ''),
              placeholder: t.usernamePh,
              value: username,
              required: true,
              autoComplete: 'username',
              onChange: e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }),
            h('span', { className: 'input-hint' }, lang === 'ar' ? 'من 3 لـ 20 حرف إنجليزي أو أرقام بدون مسافات' : '3-20 lowercase letters, numbers, or underscores')
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.gmail),
            h('div', { className: 'input-with-icon' },
              h(MailIcon),
              h('input', {
                type: 'email',
                className: 'form-input' + (gmail && !gmail.trim().toLowerCase().endsWith('@gmail.com') ? ' is-invalid' : ''),
                placeholder: t.gmailPh,
                value: gmail,
                required: true,
                autoComplete: 'email',
                onChange: e => setGmail(e.target.value)
              })
            ),
            h('span', { className: 'input-hint' }, lang === 'ar' ? 'إيميل Gmail بينتهي بـ @gmail.com' : 'Valid Gmail account ending in @gmail.com')
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.phone),
            h('div', { className: 'phone-input-row', dir: 'ltr' },
              h(CountryPicker, { selected: country, onSelect: setCountry, lang }),
              h('input', {
                type: 'tel',
                dir: 'ltr',
                className: 'form-input phone-input',
                placeholder: t.phonePh,
                value: phone,
                required: true,
                autoComplete: 'tel',
                onChange: e => setPhone(e.target.value.replace(/\D/g, ''))
              })
            )
          ),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
              h('label', null, t.password),
              h('div', { className: 'input-with-icon has-toggle' },
                h(LockIcon),
                h('input', {
                  type: showPass ? 'text' : 'password',
                  className: 'form-input',
                  placeholder: t.passwordPh,
                  value: password,
                  required: true,
                  autoComplete: 'new-password',
                  onChange: e => setPassword(e.target.value)
                }),
                h('button', {
                  type: 'button',
                  className: 'pass-toggle-btn',
                  onClick: () => setShowPass(!showPass),
                  title: showPass ? (lang === 'ar' ? 'إخفاء الباسورد' : 'Hide password') : (lang === 'ar' ? 'إظهار الباسورد' : 'Show password')
                }, h(EyeIcon, { off: showPass }))
              )
            ),
            h('div', { className: 'form-group' },
              h('label', null, t.confirmPassword),
              h('div', { className: 'input-with-icon has-toggle' },
                h(LockIcon),
                h('input', {
                  type: showPass ? 'text' : 'password',
                  className: 'form-input' + (confirmPassword && confirmPassword !== password ? ' is-invalid' : ''),
                  placeholder: t.confirmPasswordPh,
                  value: confirmPassword,
                  required: true,
                  autoComplete: 'new-password',
                  onChange: e => setConfirmPassword(e.target.value)
                }),
                h('button', {
                  type: 'button',
                  className: 'pass-toggle-btn',
                  onClick: () => setShowPass(!showPass),
                  title: showPass ? (lang === 'ar' ? 'إخفاء الباسورد' : 'Hide password') : (lang === 'ar' ? 'إظهار الباسورد' : 'Show password')
                }, h(EyeIcon, { off: showPass }))
              )
            )
          ),
          /* Stream radio buttons removed - default to Arabic */
          h('button', { type: 'submit', className: 'solid auth-submit-btn', disabled: loading || AUTH_PAUSED },
            loading ? (lang === 'ar' ? 'ثواني بنعمل الحساب...' : 'Creating Account...') : t.btnRegister),
          h('p', { className: 'auth-switch-note' },
            t.haveAccount, ' ',
            h('button', { type: 'button', className: 'auth-link-btn', onClick: () => { setTab('login'); setError(''); } }, t.goToLogin))
          )
        ) : h('form', { className: 'auth-form', onSubmit: handleLogin },
          h('fieldset', { className: 'auth-fieldset', disabled: AUTH_PAUSED },
          h('div', { className: 'form-group' },
            h('label', null, lang === 'ar' ? 'اسم المستخدم أو إيميلك (Gmail)' : 'Username or Gmail'),
            h('div', { className: 'input-with-icon' },
              h(UserIcon),
              h('input', {
                type: 'text',
                className: 'form-input',
                placeholder: lang === 'ar' ? 'اكتب اسم المستخدم أو إيميلك' : 'Enter username or Gmail',
                value: loginInput,
                required: true,
                autoFocus: true,
                autoComplete: 'username',
                onChange: e => setLoginInput(e.target.value)
              })
            )
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.password),
            h('div', { className: 'input-with-icon has-toggle' },
              h(LockIcon),
              h('input', {
                type: showPass ? 'text' : 'password',
                className: 'form-input',
                placeholder: lang === 'ar' ? 'اكتب الباسورد بتاعك' : 'Enter your password',
                value: loginPassword,
                required: true,
                autoComplete: 'current-password',
                onChange: e => setLoginPassword(e.target.value)
              }),
              h('button', {
                type: 'button',
                className: 'pass-toggle-btn',
                onClick: () => setShowPass(!showPass),
                title: showPass ? (lang === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (lang === 'ar' ? 'إظهار كلمة المرور' : 'Show password')
              }, h(EyeIcon, { off: showPass }))
            )
          ),
          h('button', { type: 'submit', className: 'solid auth-submit-btn', disabled: loading },
            loading ? (lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing In...') : t.btnLogin),
          h('p', { className: 'auth-switch-note' },
            t.noAccount, ' ',
            h('button', { type: 'button', className: 'auth-link-btn', onClick: () => { setTab('register'); setError(''); } }, t.goToRegister))
          )
        ),
        h('div', { className: 'auth-guest-box' },
          h('div', { className: 'auth-guest-divider' },
            h('span', null, t.orDivider || (lang === 'ar' ? 'أو' : 'OR'))
          ),
          h('button', {
            type: 'button',
            className: 'auth-guest-btn',
            onClick: () => {
              const res = App.Auth.loginAsGuest(stream || lang);
              onAuthSuccess(res.user);
            }
          },
            h('svg', { className: 'ag-icon', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
              h('circle', { cx: 12, cy: 7, r: 4 })),
            h('div', { className: 'ag-btn-content' },
              h('span', { className: 'ag-btn-title' }, t.guestSignIn || (lang === 'ar' ? 'المتابعة كزائر' : 'Continue as Guest')),
              h('span', { className: 'ag-btn-desc' }, t.guestSubtitle || (lang === 'ar' ? 'تصفّح الكورسات والدروس مباشرة دون حفظ التقدّم' : 'Browse courses without saving progress'))
            ),
            null
          )
        ),
        h('div', { className: 'auth-foot' },
          h('div', { className: 'auth-foot-copy' },
            h('span', null,
              h('bdi', { dir: 'ltr' }, '© ' + new Date().getFullYear() + ' ' + (t.copyrightOwner || 'AborayaTechnologies')),
              ' · ',
              t.footerRights || 'جميع الحقوق محفوظة'
            ),
            h(MadeByMagedBadge)
          ),
          h('div', { className: 'auth-foot-actions' },
            h('button', {
              type: 'button',
              className: 'auth-lang-toggle',
              onClick: () => setLang(lang === 'ar' ? 'en' : 'ar')
            }, lang === 'ar' ? 'EN' : 'AR')
          )
        )
      )
    );
  }

  const ChartBarIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
    h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
    h('line', { x1: 6, y1: 20, x2: 6, y2: 14 }),
    h('line', { x1: 3, y1: 20, x2: 21, y2: 20 }));

  const ClockIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('polyline', { points: '12 6 12 12 16 14' }));

  const TrophyIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('path', { d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
    h('path', { d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
    h('path', { d: 'M4 22h16' }),
    h('path', { d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' }),
    h('path', { d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' }),
    h('path', { d: 'M18 2H6v7a6 6 0 0 0 12 0V2Z' }));

  /* ============ Neo-Brutalist student profile menu in header ============ */
  function StudentProfileMenu({ user, meta, onLogout, onSetLang, lang, route }) {
    const { t } = useLang();
    const store = useStore();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      if (open) document.addEventListener('pointerdown', onDoc);
      return () => document.removeEventListener('pointerdown', onDoc);
    }, [open]);

    useEffect(() => {
      setOpen(false);
    }, [route && route.key]);

    const isAr = lang === 'ar';
    const isGuest = !!user.isGuest;
    const metrics = useMemo(() => {
      if (App.ProgressMetrics && App.ProgressMetrics.computeDashboardMetrics) {
        return App.ProgressMetrics.computeDashboardMetrics(meta, store, lang);
      }
      return {
        totalLessons: 14,
        completedLessons: 0,
        completionPct: 0,
        avgQuizPct: 0,
        studyDuration: { shortFormatted: isAr ? '0 د' : '0m', formatted: isAr ? '0 دقيقة' : '0 min' },
        rank: { title: isAr ? 'متعلّم نشط' : 'Active Learner', color: '#ffd233' },
        nextRecommendedLesson: { id: '1-1', numberLabel: '1.1', title: '' }
      };
    }, [meta, store, lang]);

    const displayName = user.name || (isAr ? 'طالب Syntax' : 'Syntax Student');
    const cleanName = String(displayName).trim();
    const initial = cleanName ? cleanName[0].toUpperCase() : (isAr ? 'ط' : 'S');
    const avatarBg = user.avatarColor || '#ffd233';
    const avatarFg = avatarBg === '#ffd233' ? '#111111' : '#ffffff';
    const isDashboardActive = route && route.name === 'dashboard';

    return h('div', { className: 'student-profile-wrap', ref },
      h('button', {
        type: 'button',
        className: 'student-profile-btn' + (open ? ' is-active' : '') + (isDashboardActive ? ' on-dashboard' : ''),
        onClick: () => setOpen(!open),
        'aria-expanded': open,
        'aria-label': isAr ? 'فتح قائمة حساب الطالب ولوحة التقدم' : 'Open student profile and progress menu'
      },
        h('span', {
          className: 'student-avatar-block',
          style: { background: avatarBg, color: avatarFg }
        }, initial),
        h('span', { className: 'student-btn-info' },
          h('span', { className: 'student-name-pill' }, displayName),
          h('span', { className: 'student-prog-mini', dir: 'ltr' }, `${metrics.completedLessons}/${metrics.totalLessons}`)
        ),
        h('svg', {
          className: 'student-btn-chev' + (open ? ' is-open' : ''),
          width: 12,
          height: 12,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }, h('polyline', { points: '6 9 12 15 18 9' }))
      ),
      open ? h('div', {
        className: 'student-menu-card',
        dir: isAr ? 'rtl' : 'ltr',
        role: 'dialog',
        'aria-label': isAr ? 'بطاقة حساب الطالب' : 'Student Account Card'
      },
        /* 1. Identity Header */
        h('div', { className: 'smc-head' },
          h('div', {
            className: 'smc-avatar-big',
            style: { background: avatarBg, color: avatarFg }
          }, initial),
          h('div', { className: 'smc-info' },
            h('div', { className: 'smc-name-row' },
              h('span', { className: 'smc-name' }, displayName),
              h('a', {
                href: '#/dashboard?edit=1',
                className: 'smc-edit-mini',
                onClick: () => setOpen(false),
                title: isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'
              }, h(EditIcon))
            ),
            h('div', { className: 'smc-grade' },
              user.gradeTitle || (isAr ? 'الصف الثاني الثانوي · البكالوريا' : '2nd Secondary · Baccalaureate')
            ),
            h('div', { className: 'smc-rank-line' },
              h('span', { className: 'smc-rank-tag' }, metrics.rank.title),
              h('span', { className: 'smc-sep', 'aria-hidden': 'true' }, '·'),
              h('span', { className: 'smc-user-handle', dir: 'ltr' }, '@' + (user.username || 'syntax_student'))
            )
          )
        ),

        /* 2. 3-Column Live Telemetry Strip */
        h('div', { className: 'smc-stats-grid' },
          h('div', { className: 'smc-stat-box' },
            h('strong', { className: 'smc-stat-val', dir: 'ltr' }, `${metrics.completedLessons}/${metrics.totalLessons}`),
            h('span', { className: 'smc-stat-lbl' }, isAr ? 'الدروس المكتملة' : 'Completed')
          ),
          h('div', { className: 'smc-stat-box' },
            h('strong', { className: 'smc-stat-val', dir: 'ltr' }, `${metrics.avgQuizPct}%`),
            h('span', { className: 'smc-stat-lbl' }, isAr ? 'متوسط الاختبارات' : 'Quiz Score')
          ),
          h('div', { className: 'smc-stat-box' },
            h('strong', { className: 'smc-stat-val', dir: isAr ? 'rtl' : 'ltr' }, metrics.studyDuration.shortFormatted),
            h('span', { className: 'smc-stat-lbl' }, isAr ? 'وقت التعلّم' : 'Study Time')
          )
        ),

        /* 3. Overall Mastery Bar */
        h('div', { className: 'smc-mastery-box' },
          h('div', { className: 'smc-mastery-top' },
            h('span', null, isAr ? 'إتقان المنهج الكلي' : 'Overall Course Mastery'),
            h('b', { dir: 'ltr' }, `${metrics.completionPct}%`)
          ),
          h('div', { className: 'smc-mastery-track' },
            h('div', {
              className: 'smc-mastery-fill',
              style: { width: `${metrics.completionPct}%` }
            })
          )
        ),

        /* 4. Primary CTA: Open Visual Progress Dashboard */
        h('a', {
          href: '#/dashboard',
          className: 'smc-dashboard-cta',
          onClick: () => setOpen(false)
        },
          h(ChartBarIcon),
          h('span', null, isAr ? 'لوحة التقدم والإحصائيات' : 'Visual Progress Dashboard'),
          h('span', { className: 'smc-cta-arr', 'aria-hidden': 'true' }, isAr ? '←' : '→')
        ),

        /* 5. Secondary Quick Actions */
        h('div', { className: 'smc-quick-links' },
          metrics.nextRecommendedLesson ? h('a', {
            href: '#/lesson/' + metrics.nextRecommendedLesson.id,
            className: 'smc-quick-item',
            onClick: () => setOpen(false)
          },
            h('span', { className: 'smc-qi-badge', dir: 'ltr' }, metrics.nextRecommendedLesson.numberLabel),
            h('span', { className: 'smc-qi-text' },
              isAr
                ? `استكمل: ${metrics.nextRecommendedLesson.title}`
                : `Continue: ${metrics.nextRecommendedLesson.title}`
            )
          ) : null,
          h('div', { className: 'smc-lang-row' },
            h('span', { className: 'smc-lang-lbl' }, isAr ? 'لغة الدراسة:' : 'Study Language:'),
            h('div', { className: 'smc-lang-btns', dir: 'ltr' },
              h('button', {
                type: 'button',
                className: 'smc-lang-btn' + (lang === 'ar' ? ' active' : ''),
                onClick: () => onSetLang && onSetLang('ar')
              }, 'AR'),
              h('button', {
                type: 'button',
                className: 'smc-lang-btn' + (lang === 'en' ? ' active' : ''),
                onClick: () => onSetLang && onSetLang('en')
              }, 'EN')
            )
          )
        ),

        /* 6. Account / Sign In / Logout Footer */
        h('div', { className: 'smc-foot-actions' },
          h('a', {
            href: '#/dashboard?edit=1',
            className: 'smc-edit-profile-btn',
            onClick: () => setOpen(false)
          },
            h(EditIcon),
            h('span', null, isAr ? 'تعديل الملف' : 'Edit Profile')
          ),
          h('button', {
            type: 'button',
            className: 'smc-logout-btn',
            onClick: () => {
              setOpen(false);
              onLogout();
            }
          },
            h(LogoutIcon),
            h('span', null, isGuest ? (isAr ? 'بوابة الحساب' : 'Account Portal') : (t.logout || (isAr ? 'تسجيل الخروج' : 'Sign Out')))
          )
        )
      ) : null
    );
  }

  /* ============ Visual Student Progress Dashboard (#/dashboard) ============ */
  const AVATAR_PALETTE = [
    { hex: '#ffd233', labelAr: 'أصفر Syntax', labelEn: 'Syntax Yellow' },
    { hex: '#2563eb', labelAr: 'أزرق هندسي', labelEn: 'Royal Blue' },
    { hex: '#16a34a', labelAr: 'أخضر زمردي', labelEn: 'Emerald Green' },
    { hex: '#e5484d', labelAr: 'أحمر قرمزي', labelEn: 'Crimson Red' }
  ];

  function StudentProgressDashboard({ meta, user, route }) {
    const { lang } = useLang();
    const store = useStore();
    useScan();
    const isAr = lang === 'ar';

    const [statusFilter, setStatusFilter] = useState('all'); // all | completed | in-progress | not-started
    const [chapterFilter, setChapterFilter] = useState('all'); // all | 1 | 2 | 3 | 4
    const [editingProfile, setEditingProfile] = useState(() => Boolean(route && route.editProfile));
    const [editName, setEditName] = useState(user ? user.name || '' : '');
    const [editGrade, setEditGrade] = useState(user ? user.gradeTitle || '' : '');
    const [editColor, setEditColor] = useState(user ? user.avatarColor || '#ffd233' : '#ffd233');
    const [editGoal, setEditGoal] = useState(store.dailyGoalMinutes || 30);
    const [savedToast, setSavedToast] = useState('');

    useEffect(() => {
      if (route && route.editProfile) setEditingProfile(true);
    }, [route && route.editProfile]);

    useEffect(() => {
      if (user) {
        setEditName(user.name || '');
        setEditGrade(user.gradeTitle || (isAr ? 'الصف الثاني الثانوي · البكالوريا' : '2nd Secondary · Baccalaureate'));
        setEditColor(user.avatarColor || '#ffd233');
      }
    }, [user, isAr]);

    const metrics = useMemo(() => {
      return App.ProgressMetrics.computeDashboardMetrics(meta, store, lang);
    }, [meta, store, lang]);

    const filteredLessons = useMemo(() => {
      return metrics.allLessons.filter(ls => {
        if (statusFilter !== 'all' && ls.status !== statusFilter) return false;
        if (chapterFilter !== 'all' && Number(ls.chapterId) !== Number(chapterFilter)) return false;
        return true;
      });
    }, [metrics.allLessons, statusFilter, chapterFilter]);

    const showToast = (msg) => {
      setSavedToast(msg);
      setTimeout(() => setSavedToast(''), 2600);
    };

    const handleSaveProfile = (e) => {
      e.preventDefault();
      const cleanName = editName.trim() || (isAr ? 'طالب Syntax' : 'Syntax Student');
      const cleanGrade = editGrade.trim() || (isAr ? 'الصف الثاني الثانوي · البكالوريا' : '2nd Secondary · Baccalaureate');
      App.Auth.updateProfile({
        name: cleanName,
        gradeTitle: cleanGrade,
        avatarColor: editColor
      });
      Store.setDailyGoal(editGoal);
      setEditingProfile(false);
      showToast(isAr ? 'تم حفظ بيانات ملفك الشخصي وهدفك اليومي بنجاح!' : 'Profile & daily study goal saved!');
    };

    const handleLogStudyMinutes = (mins, lessonId = null) => {
      Store.recordStudyTime(lessonId, mins * 60);
      showToast(
        isAr
          ? `تم تسجيل +${mins} دقيقة في سجل دراستك اليوم!`
          : `Logged +${mins} minutes to today's study time!`
      );
    };

    const handleToggleLesson = (ls) => {
      Store.toggleLessonComplete(ls.id, ls.estimatedMinutes);
      showToast(
        ls.isCompleted
          ? (isAr ? `تم إعادة الدرس ${ls.numberLabel} إلى قيد المراجعة` : `Marked Lesson ${ls.numberLabel} as in review`)
          : (isAr ? `أحسنت! تم تسجيل الدرس ${ls.numberLabel} كمكتمل` : `Lesson ${ls.numberLabel} marked as completed!`)
      );
    };

    const displayName = (user && user.name) || (isAr ? 'طالب Syntax' : 'Syntax Student');
    const initial = String(displayName).trim()[0] ? String(displayName).trim()[0].toUpperCase() : 'S';
    const avatarBg = (user && user.avatarColor) || '#ffd233';
    const avatarFg = avatarBg === '#ffd233' ? '#111111' : '#ffffff';
    const rankFg = metrics.rank.color === '#ffd233' ? '#111111' : '#ffffff';
    const maxWeeklyMin = Math.max(metrics.dailyGoalMinutes, ...metrics.weeklySeries.map(d => d.minutes), 45);

    return h('main', { id: 'main', className: 'progress-dashboard-view' },
      /* 1. Breadcrumb */
      h('nav', { className: 'cip-breadcrumb spd-breadcrumb', 'aria-label': 'Breadcrumb' },
        h('a', { href: '#/' }, isAr ? 'الرئيسية' : 'Home'),
        h('span', null, '/'),
        h('a', { href: '#/course/students' }, isAr ? 'كورس البكالوريا' : 'Baccalaureate Course'),
        h('span', null, '/'),
        h('span', { style: { color: '#111111', fontWeight: 800 } }, isAr ? 'لوحة التقدم والإحصائيات' : 'Student Progress Dashboard')
      ),

      savedToast ? h('div', { className: 'spd-toast', role: 'status' },
        h(CheckIcon),
        h('span', null, savedToast)
      ) : null,

      /* 2. Student Profile & Mastery Hero Card */
      h('section', { className: 'spd-hero-card' },
        h('div', { className: 'spd-hero-main' },
          h('div', { className: 'spd-identity-block' },
            h('div', {
              className: 'spd-avatar-xl',
              style: { background: avatarBg, color: avatarFg }
            }, initial),
            h('div', { className: 'spd-identity-text' },
              h('div', { className: 'spd-rank-kicker' },
                h('span', { className: 'spd-rank-badge', style: { background: metrics.rank.color, color: rankFg } }, metrics.rank.title),
                h('span', { className: 'spd-sep', 'aria-hidden': 'true' }, '·'),
                h('span', { className: 'spd-handle', dir: 'ltr' }, '@' + ((user && user.username) || 'syntax_student'))
              ),
              h('h1', { className: 'spd-student-name' }, displayName),
              h('p', { className: 'spd-student-grade' },
                (user && user.gradeTitle) || (isAr ? 'الصف الثاني الثانوي · مسار البرمجة والذكاء الاصطناعي' : '2nd Secondary Baccalaureate · Programming & AI Track')
              ),
              h('div', { className: 'spd-profile-actions' },
                h('button', {
                  type: 'button',
                  className: 'spd-btn-outline' + (editingProfile ? ' active' : ''),
                  onClick: () => setEditingProfile(!editingProfile)
                },
                  h(EditIcon),
                  h('span', null, editingProfile ? (isAr ? 'إغلاق التعديل' : 'Close Editor') : (isAr ? 'تعديل الملف والهدف اليومي' : 'Edit Profile & Daily Goal'))
                ),
                h('button', {
                  type: 'button',
                  className: 'spd-btn-outline',
                  onClick: () => handleLogStudyMinutes(15, metrics.nextRecommendedLesson ? metrics.nextRecommendedLesson.id : null)
                },
                  h(ClockIcon),
                  h('span', null, isAr ? 'تسجيل +15 د مذاكرة' : 'Log +15m Study')
                )
              )
            )
          ),

          /* Next Lesson CTA Box */
          metrics.nextRecommendedLesson ? h('div', { className: 'spd-next-card' },
            h('div', { className: 'spd-next-top' },
              h('span', { className: 'spd-next-tag' },
                metrics.nextRecommendedLesson.status === 'in-progress'
                  ? (isAr ? 'قيد الدراسة حالياً' : 'IN PROGRESS NOW')
                  : (isAr ? 'الخطوة التالية المقترحة' : 'NEXT RECOMMENDED')
              ),
              h('span', { className: 'spd-next-code', dir: 'ltr' }, `Lesson ${metrics.nextRecommendedLesson.numberLabel}`)
            ),
            h('h2', { className: 'spd-next-title' }, metrics.nextRecommendedLesson.title),
            h('p', { className: 'spd-next-meta' },
              `${metrics.nextRecommendedLesson.chapterTitle} · ${metrics.nextRecommendedLesson.estimatedMinutes} ${isAr ? 'دقيقة' : 'min'}`
            ),
            h('div', { className: 'spd-next-btns' },
              h('a', {
                href: '#/lesson/' + metrics.nextRecommendedLesson.id,
                className: 'solid spd-next-cta'
              },
                h('span', null, isAr ? 'استكمل الدرس الآن' : 'Continue Lesson Now'),
                h('span', { 'aria-hidden': 'true' }, isAr ? '←' : '→')
              )
            )
          ) : null
        ),

        /* Inline Profile & Study Goal Editor Drawer */
        editingProfile ? h('form', { className: 'spd-profile-editor', onSubmit: handleSaveProfile },
          h('div', { className: 'spd-pe-head' },
            h('h3', null, isAr ? 'تخصيص ملف الطالب وهدف الدراسة اليومي' : 'Customize Student Profile & Daily Study Goal'),
            h('p', null, isAr ? 'تظهر هذه البيانات في شريط المنصة العلوي وفي تقارير تقدمك.' : 'Your name, badge color, and study goal appear across your header and progress reports.')
          ),
          h('div', { className: 'spd-pe-grid' },
            h('label', { className: 'spd-pe-field' },
              h('span', null, isAr ? 'اسم الطالب' : 'Student Name'),
              h('input', {
                type: 'text',
                className: 'spd-pe-input',
                value: editName,
                onChange: e => setEditName(e.target.value),
                placeholder: isAr ? 'اكتب اسمك...' : 'Enter your name...'
              })
            ),
            h('label', { className: 'spd-pe-field' },
              h('span', null, isAr ? 'الصف الدراسي / المسار' : 'Grade / Study Track'),
              h('input', {
                type: 'text',
                className: 'spd-pe-input',
                value: editGrade,
                onChange: e => setEditGrade(e.target.value),
                placeholder: isAr ? 'الصف الثاني الثانوي · البكالوريا' : '2nd Secondary · Baccalaureate'
              })
            ),
            h('div', { className: 'spd-pe-field' },
              h('span', null, isAr ? 'هدف الدراسة اليومي (دقيقة)' : 'Daily Study Goal (Minutes)'),
              h('div', { className: 'spd-goal-pills', dir: 'ltr' },
                [15, 30, 45, 60, 90].map(g =>
                  h('button', {
                    key: g,
                    type: 'button',
                    className: 'spd-goal-pill' + (Number(editGoal) === g ? ' active' : ''),
                    onClick: () => setEditGoal(g)
                  }, `${g}m`)
                )
              )
            ),
            h('div', { className: 'spd-pe-field' },
              h('span', null, isAr ? 'لون شارة الملف الشخصي' : 'Profile Badge Color'),
              h('div', { className: 'spd-color-swatches' },
                AVATAR_PALETTE.map(sw =>
                  h('button', {
                    key: sw.hex,
                    type: 'button',
                    className: 'spd-color-swatch' + (editColor === sw.hex ? ' active' : ''),
                    style: { background: sw.hex },
                    onClick: () => setEditColor(sw.hex),
                    title: isAr ? sw.labelAr : sw.labelEn,
                    'aria-label': isAr ? sw.labelAr : sw.labelEn
                  }, editColor === sw.hex ? '✓' : '')
                )
              )
            )
          ),
          h('div', { className: 'spd-pe-actions' },
            h('button', { type: 'submit', className: 'solid spd-pe-save' },
              h(CheckIcon),
              h('span', null, isAr ? 'حفظ التعديلات' : 'Save Profile Changes')
            ),
            h('button', {
              type: 'button',
              className: 'ghost spd-pe-cancel',
              onClick: () => setEditingProfile(false)
            }, isAr ? 'إلغاء' : 'Cancel')
          )
        ) : null
      ),

      /* 3. 4-Card KPI Summary Strip */
      h('section', { className: 'spd-kpi-grid', 'aria-label': isAr ? 'ملخص الإحصائيات' : 'Key Progress Metrics' },
        /* KPI 1: Completed Lessons */
        h('article', { className: 'spd-kpi-card' },
          h('div', { className: 'spd-kpi-top' },
            h('span', { className: 'spd-kpi-label' }, isAr ? 'الدروس المكتملة' : 'COMPLETED LESSONS'),
            h('span', { className: 'spd-kpi-tag tag-blue', dir: 'ltr' }, `${metrics.completionPct}%`)
          ),
          h('div', { className: 'spd-kpi-value', dir: 'ltr' },
            h('strong', null, metrics.completedLessons),
            h('span', { className: 'spd-kpi-denom' }, `/ ${metrics.totalLessons}`)
          ),
          h('div', { className: 'spd-14-segments', dir: 'ltr', 'aria-hidden': 'true' },
            metrics.allLessons.map(ls =>
              h('span', {
                key: ls.id,
                className: 'spd-seg-block is-' + ls.status,
                title: `${ls.numberLabel}: ${ls.title}`
              })
            )
          ),
          h('p', { className: 'spd-kpi-foot' },
            isAr
              ? `${metrics.inProgressLessons} قيد الدراسة · ${metrics.notStartedLessons} متبقي`
              : `${metrics.inProgressLessons} in progress · ${metrics.notStartedLessons} remaining`
          )
        ),

        /* KPI 2: Quiz Score Average */
        h('article', { className: 'spd-kpi-card' },
          h('div', { className: 'spd-kpi-top' },
            h('span', { className: 'spd-kpi-label' }, isAr ? 'متوسط درجات الاختبارات' : 'QUIZ SCORE AVERAGE'),
            h('span', { className: 'spd-kpi-tag tag-yellow', dir: 'ltr' },
              metrics.quizTakenCount > 0 ? `${metrics.totalEarnedPoints}/${metrics.totalPossiblePoints}` : '0/0'
            )
          ),
          h('div', { className: 'spd-kpi-value', dir: 'ltr' },
            h('strong', null, `${metrics.avgQuizPct}%`)
          ),
          h('div', { className: 'spd-kpi-bar-track' },
            h('div', {
              className: 'spd-kpi-bar-fill fill-green',
              style: { width: `${metrics.avgQuizPct}%` }
            })
          ),
          h('p', { className: 'spd-kpi-foot' },
            isAr
              ? `أعلى درجة: ${metrics.bestQuizPct}% · ${metrics.quizTakenCount} اختبارات مجتازة`
              : `Best score: ${metrics.bestQuizPct}% · ${metrics.quizTakenCount} quizzes completed`
          )
        ),

        /* KPI 3: Time Spent Learning */
        h('article', { className: 'spd-kpi-card' },
          h('div', { className: 'spd-kpi-top' },
            h('span', { className: 'spd-kpi-label' }, isAr ? 'الوقت المستغرق في التعلّم' : 'TIME SPENT LEARNING'),
            h('span', { className: 'spd-kpi-tag tag-green', dir: 'ltr' }, `${metrics.todayMinutes}/${metrics.dailyGoalMinutes}m`)
          ),
          h('div', { className: 'spd-kpi-value' },
            h('strong', null, metrics.studyDuration.formatted)
          ),
          h('div', { className: 'spd-kpi-bar-track' },
            h('div', {
              className: 'spd-kpi-bar-fill fill-yellow',
              style: { width: `${metrics.dailyGoalPct}%` }
            })
          ),
          h('p', { className: 'spd-kpi-foot' },
            isAr
              ? `مذاكرة اليوم: ${metrics.todayMinutes} د من هدفك (${metrics.dailyGoalMinutes} د)`
              : `Today: ${metrics.todayMinutes}m of your ${metrics.dailyGoalMinutes}m daily goal`
          )
        ),

        /* KPI 4: Study Streak & Strongest Chapter */
        h('article', { className: 'spd-kpi-card' },
          h('div', { className: 'spd-kpi-top' },
            h('span', { className: 'spd-kpi-label' }, isAr ? 'سلسلة الالتزام والأداء' : 'STUDY STREAK & FOCUS'),
            h('span', { className: 'spd-kpi-tag tag-dark', dir: 'ltr' }, `${metrics.weeklyTotalMinutes}m / 7d`)
          ),
          h('div', { className: 'spd-kpi-value' },
            h('strong', null, `${metrics.streakDays} ${isAr ? 'أيام' : 'Days'}`)
          ),
          h('div', { className: 'spd-kpi-bar-track' },
            h('div', {
              className: 'spd-kpi-bar-fill fill-blue',
              style: { width: `${Math.min(100, metrics.streakDays * 16)}%` }
            })
          ),
          h('p', { className: 'spd-kpi-foot' },
            metrics.strongestChapter
              ? (isAr
                ? `أقوى فصل: الفصل 0${metrics.strongestChapter.id} (${metrics.strongestChapter.pct}%)`
                : `Top module: Chapter 0${metrics.strongestChapter.id} (${metrics.strongestChapter.pct}%)`)
              : (isAr ? 'ابدأ أول درس اليوم لبناء سلسلتك' : 'Start a lesson today to build your streak')
          )
        )
      ),

      /* 4. 2-Column Visual Analytics Grid: Chapter Mastery + Weekly Study Time & Quiz Distribution */
      h('section', { className: 'spd-charts-grid' },
        /* Left Card: Chapter-by-Chapter Progress & Quiz Mastery */
        h('div', { className: 'spd-panel-card' },
          h('div', { className: 'spd-panel-head' },
            h('div', null,
              h('span', { className: 'spd-panel-kicker' }, isAr ? 'تحليل الفصول الأربعة' : 'MODULE BREAKDOWN'),
              h('h2', { className: 'spd-panel-title' }, isAr ? 'مستوى التقدم والدرجات لكل فصل' : 'Chapter Completion & Quiz Mastery')
            )
          ),
          h('div', { className: 'spd-chapter-bars' },
            metrics.chapters.map(ch =>
              h('div', { key: ch.id, className: 'spd-ch-item' },
                h('div', { className: 'spd-ch-top' },
                  h('div', { className: 'spd-ch-title-group' },
                    h('span', {
                      className: 'spd-ch-badge',
                      style: { background: ch.accent },
                      dir: 'ltr'
                    }, `CH 0${ch.id}`),
                    h('strong', { className: 'spd-ch-name' }, ch.title)
                  ),
                  h('div', { className: 'spd-ch-metrics', dir: 'ltr' },
                    h('span', null, `${ch.completedCount}/${ch.totalCount} ${isAr ? 'دروس' : 'done'}`),
                    h('span', { 'aria-hidden': 'true' }, '·'),
                    h('span', null, ch.avgQuizPct != null ? `${ch.avgQuizPct}% quiz` : (isAr ? 'بدون اختبار' : 'no quiz')),
                    h('span', { 'aria-hidden': 'true' }, '·'),
                    h('span', null, `${ch.studyMinutes}m`)
                  )
                ),
                h('div', { className: 'spd-ch-bar-track' },
                  h('div', {
                    className: 'spd-ch-bar-fill',
                    style: { width: `${ch.pct}%`, background: ch.accent }
                  })
                ),
                h('div', { className: 'spd-ch-lessons-mini' },
                  ch.lessons.map(ls =>
                    h('a', {
                      key: ls.id,
                      href: '#/lesson/' + ls.id,
                      className: 'spd-mini-lesson-btn is-' + ls.status,
                      title: `${ls.numberLabel} ${ls.title}`
                    },
                      h('span', { dir: 'ltr' }, ls.numberLabel),
                      h('span', null, ls.isCompleted ? '✓' : ls.isStarted ? '◐' : '○')
                    )
                  )
                )
              )
            )
          )
        ),

        /* Right Card: 7-Day Study Time Chart + Quiz Score Tier Breakdown */
        h('div', { className: 'spd-panel-card' },
          h('div', { className: 'spd-panel-head' },
            h('div', null,
              h('span', { className: 'spd-panel-kicker' }, isAr ? 'سجل الوقت والاختبارات' : 'STUDY TIME & QUIZ ANALYTICS'),
              h('h2', { className: 'spd-panel-title' }, isAr ? 'نشاط الدراسة الأسبوعي وتوزيع الدرجات' : '7-Day Study Log & Score Tiers')
            ),
            h('div', { className: 'spd-goal-quick', dir: 'ltr' },
              [15, 30, 45, 60].map(g =>
                h('button', {
                  key: g,
                  type: 'button',
                  className: 'spd-goal-chip' + (metrics.dailyGoalMinutes === g ? ' active' : ''),
                  onClick: () => Store.setDailyGoal(g),
                  title: isAr ? `تحديد الهدف اليومي: ${g} دقيقة` : `Set daily goal: ${g} minutes`
                }, `${g}m`)
              )
            )
          ),

          /* 7-Day Bar Chart */
          h('div', { className: 'spd-weekly-chart' },
            metrics.weeklySeries.map(day => {
              const heightPct = Math.min(100, Math.max(8, Math.round((day.minutes / maxWeeklyMin) * 100)));
              return h('div', {
                key: day.dateKey,
                className: 'spd-day-col' + (day.isToday ? ' is-today' : '') + (day.metGoal ? ' met-goal' : '')
              },
                h('span', { className: 'spd-day-val', dir: 'ltr' }, `${day.minutes}m`),
                h('div', { className: 'spd-day-bar-wrap' },
                  h('div', {
                    className: 'spd-day-bar',
                    style: { height: `${heightPct}%` }
                  })
                ),
                h('span', { className: 'spd-day-lbl' }, day.dayLabel)
              );
            })
          ),

          /* Quiz Score Distribution Breakdown */
          h('div', { className: 'spd-quiz-dist' },
            h('div', { className: 'spd-qd-head' },
              h('strong', null, isAr ? 'توزيع نتائج الاختبارات (الكويزات)' : 'Quiz Score Breakdown'),
              h('span', { dir: 'ltr' }, `${metrics.quizTakenCount} / ${metrics.totalLessons} ${isAr ? 'مكتمل' : 'graded'}`)
            ),
            h('div', { className: 'spd-qd-grid' },
              h('div', { className: 'spd-qd-box tier-excellent' },
                h('strong', { dir: 'ltr' }, metrics.scoreDistribution.excellent),
                h('span', null, isAr ? 'ممتاز (80%+)' : 'Excellent (80%+)')
              ),
              h('div', { className: 'spd-qd-box tier-good' },
                h('strong', { dir: 'ltr' }, metrics.scoreDistribution.good),
                h('span', null, isAr ? 'جيد (50–79%)' : 'Good (50–79%)')
              ),
              h('div', { className: 'spd-qd-box tier-review' },
                h('strong', { dir: 'ltr' }, metrics.scoreDistribution.review),
                h('span', null, isAr ? 'مراجعة (<50%)' : 'Needs Review (<50%)')
              ),
              h('div', { className: 'spd-qd-box tier-remaining' },
                h('strong', { dir: 'ltr' }, metrics.scoreDistribution.remaining),
                h('span', null, isAr ? 'لم يُختبر بعد' : 'Not Taken Yet')
              )
            )
          )
        )
      ),

      /* 5. Interactive All-14-Lessons Progress, Quiz Scores & Study Time Ledger */
      h('section', { className: 'spd-ledger-card' },
        h('div', { className: 'spd-ledger-head' },
          h('div', null,
            h('span', { className: 'spd-panel-kicker' }, isAr ? 'سجل الدروس التفصيلي' : 'COMPLETE LESSON LEDGER'),
            h('h2', { className: 'spd-panel-title' }, isAr ? 'تتبع الدروس ودرجات الكويز ووقت المذاكرة' : 'Track Lessons, Quiz Scores & Time Spent')
          ),
          h('div', { className: 'spd-ledger-controls' },
            /* Status Segmented Filter */
            h('div', { className: 'spd-filter-seg' },
              [
                { id: 'all', label: isAr ? `الكل (${metrics.totalLessons})` : `All (${metrics.totalLessons})` },
                { id: 'completed', label: isAr ? `مكتمل (${metrics.completedLessons})` : `Done (${metrics.completedLessons})` },
                { id: 'in-progress', label: isAr ? `قيد الدراسة (${metrics.inProgressLessons})` : `Active (${metrics.inProgressLessons})` },
                { id: 'not-started', label: isAr ? `متبقي (${metrics.notStartedLessons})` : `To Do (${metrics.notStartedLessons})` }
              ].map(f =>
                h('button', {
                  key: f.id,
                  type: 'button',
                  className: 'spd-seg-btn' + (statusFilter === f.id ? ' active' : ''),
                  onClick: () => setStatusFilter(f.id)
                }, f.label)
              )
            ),
            /* Chapter Filter */
            h('div', { className: 'spd-filter-seg', dir: 'ltr' },
              [
                { id: 'all', label: isAr ? 'كل الفصول' : 'All Ch' },
                { id: '1', label: 'CH 01' },
                { id: '2', label: 'CH 02' },
                { id: '3', label: 'CH 03' },
                { id: '4', label: 'CH 04' }
              ].map(cf =>
                h('button', {
                  key: cf.id,
                  type: 'button',
                  className: 'spd-seg-btn' + (String(chapterFilter) === String(cf.id) ? ' active' : ''),
                  onClick: () => setChapterFilter(cf.id)
                }, cf.label)
              )
            )
          )
        ),

        filteredLessons.length > 0 ? h('div', { className: 'spd-table-wrap' },
          h('table', { className: 'spd-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, isAr ? 'الحالة' : 'Done'),
                h('th', null, isAr ? 'الدرس والفصل' : 'Lesson & Module'),
                h('th', null, isAr ? 'تقدم الدرس' : 'Status'),
                h('th', null, isAr ? 'درجة الاختبار (الكويز)' : 'Quiz Score'),
                h('th', null, isAr ? 'وقت التعلّم' : 'Time Spent'),
                h('th', null, isAr ? 'الإجراء' : 'Action')
              )
            ),
            h('tbody', null,
              filteredLessons.map(ls =>
                h('tr', { key: ls.id, className: 'spd-row is-' + ls.status },
                  h('td', { className: 'spd-cell-check' },
                    h('button', {
                      type: 'button',
                      className: 'spd-check-btn' + (ls.isCompleted ? ' is-checked' : ''),
                      onClick: () => handleToggleLesson(ls),
                      'aria-label': ls.isCompleted
                        ? (isAr ? `إلغاء اكتمال الدرس ${ls.numberLabel}` : `Mark lesson ${ls.numberLabel} incomplete`)
                        : (isAr ? `تحديد الدرس ${ls.numberLabel} كمكتمل` : `Mark lesson ${ls.numberLabel} complete`),
                      title: isAr ? 'اضغط لتبديل حالة اكتمال الدرس' : 'Click to toggle lesson completion'
                    }, ls.isCompleted ? '✓' : '')
                  ),
                  h('td', { className: 'spd-cell-title' },
                    h('div', { className: 'spd-lt-wrap' },
                      h('span', {
                        className: 'spd-lt-num',
                        style: { borderColor: ls.chapterAccent, color: ls.chapterAccent },
                        dir: 'ltr'
                      }, ls.numberLabel),
                      h('div', { className: 'spd-lt-text' },
                        h('a', { href: '#/lesson/' + ls.id, className: 'spd-lt-link' }, ls.title),
                        h('span', { className: 'spd-lt-ch' }, `${isAr ? 'الفصل' : 'Chapter'} 0${ls.chapterId}: ${ls.chapterTitle}`)
                      )
                    )
                  ),
                  h('td', { className: 'spd-cell-status' },
                    h('span', { className: 'spd-status-label status-' + ls.status },
                      ls.isCompleted
                        ? (isAr ? 'مكتمل ✓' : 'Completed ✓')
                        : ls.isStarted
                          ? (isAr ? 'قيد الدراسة' : 'In Progress')
                          : (isAr ? 'لم يبدأ' : 'Not Started')
                    )
                  ),
                  h('td', { className: 'spd-cell-quiz' },
                    ls.hasQuizScore
                      ? h('div', { className: 'spd-quiz-cell-inner', dir: 'ltr' },
                        h('div', { className: 'spd-qc-top' },
                          h('strong', null, `${ls.best}/${ls.total}`),
                          h('span', { className: 'spd-qc-pct' }, `${ls.quizPct}%`)
                        ),
                        h('div', { className: 'spd-qc-bar' },
                          h('div', {
                            className: 'spd-qc-fill',
                            style: {
                              width: `${ls.quizPct}%`,
                              background: ls.quizPct >= 80 ? '#16a34a' : ls.quizPct >= 50 ? '#ffd233' : '#dc2626'
                            }
                          })
                        )
                      )
                      : h('span', { className: 'spd-no-quiz' }, isAr ? 'لم يُختبر بعد' : 'No quiz yet')
                  ),
                  h('td', { className: 'spd-cell-time' },
                    h('div', { className: 'spd-time-cell-inner' },
                      h('strong', { dir: 'ltr' },
                        ls.studyMinutes > 0
                          ? `${ls.studyMinutes} ${isAr ? 'د' : 'm'}`
                          : `${ls.estimatedMinutes} ${isAr ? 'د (مقدر)' : 'm (est)'}`
                      ),
                      h('button', {
                        type: 'button',
                        className: 'spd-add-time-btn',
                        onClick: () => handleLogStudyMinutes(5, ls.id),
                        title: isAr ? 'إضافة +5 دقائق مذاكرة لهذا الدرس' : 'Log +5m study time for this lesson'
                      }, '+5m')
                    )
                  ),
                  h('td', { className: 'spd-cell-action' },
                    h('a', {
                      href: '#/lesson/' + ls.id,
                      className: 'spd-open-lesson-btn'
                    },
                      h('span', null, ls.isCompleted ? (isAr ? 'مراجعة' : 'Review') : ls.isStarted ? (isAr ? 'استكمل' : 'Resume') : (isAr ? 'ابدأ' : 'Start')),
                      h('span', { 'aria-hidden': 'true' }, isAr ? '←' : '→')
                    )
                  )
                )
              )
            )
          )
        ) : h('div', { className: 'spd-empty-filter' },
          h('p', null, isAr ? 'لا توجد دروس مطابقة لفلتر البحث الحالي.' : 'No lessons match the selected filter.'),
          h('button', {
            type: 'button',
            className: 'ghost sm',
            onClick: () => { setStatusFilter('all'); setChapterFilter('all'); }
          }, isAr ? 'عرض جميع الدروس (14)' : 'Show All 14 Lessons')
        )
      )
    );
  }

  /* ============ header / universal hamburger menu / footer ============ */
  function Header({ meta, onSetLang, route, onOpenSearch, authUser, onLogout }) {
    const { t, lang } = useLang();
    const store = useStore();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
      const f = () => setScrolled(window.scrollY > 24);
      f();
      window.addEventListener('scroll', f, { passive: true });
      return () => window.removeEventListener('scroll', f);
    }, []);

    useEffect(() => {
      setMenuOpen(false);
    }, [route.key, route.target, route.courseId]);

    useEffect(() => {
      if (!menuOpen) return;
      const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const isCoursesActive = route.name === 'course' || route.target === 'courses';
    const isDashboardActive = route.name === 'dashboard';
    const isHomeActive = route.name === 'home' && !isCoursesActive;

    return h(React.Fragment, null,
      h('header', { className: 'hdr' + (scrolled ? ' scrolled' : '') + (menuOpen ? ' menu-open' : '') },
        h('a', { className: 'brand', href: '#/', dir: 'ltr' },
          h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
          h('span', { className: 'brand-t' }, t.brand || 'Syntax')),

        h('nav', { className: 'nav', 'aria-label': lang === 'ar' ? 'التنقل الرئيسي' : 'Main Navigation' },
          h('a', {
            href: '#/',
            className: 'nav-i' + (isHomeActive ? ' on' : ''),
            style: { '--a': '#2f5bff' }
          },
            h('span', { className: 'nav-t' }, lang === 'ar' ? 'الرئيسية' : 'Home')),
          h('a', {
            href: '#/courses',
            className: 'nav-i nav-courses-link' + (isCoursesActive ? ' on' : ''),
            style: { '--a': '#2f5bff' }
          },
            h(LayersIcon),
            h('span', { className: 'nav-t' }, t.coursesNav || (lang === 'ar' ? 'كورسات' : 'Courses'))),
          h('a', {
            href: '#/dashboard',
            className: 'nav-i nav-dashboard-link' + (isDashboardActive ? ' on' : ''),
            style: { '--a': '#2f5bff' }
          },
            h(ChartBarIcon),
            h('span', { className: 'nav-t' }, lang === 'ar' ? 'لوحة التقدم' : 'Progress'))),

        h('div', { className: 'hdr-r' },
          authUser ? h(StudentProfileMenu, {
            user: authUser,
            meta,
            onLogout,
            onSetLang,
            lang,
            route
          }) : null,
          h('button', {
            type: 'button',
            className: 'ham-btn' + (menuOpen ? ' is-open' : ''),
            onClick: () => setMenuOpen(prev => !prev),
            'aria-expanded': menuOpen,
            'aria-label': lang === 'ar' ? 'فتح القائمة والبحث واللغة' : 'Open menu, search, and language'
          },
            h('span', { className: 'ham-box' },
              h('span', { className: 'ham-line' }),
              h('span', { className: 'ham-line' }),
              h('span', { className: 'ham-line' }))))),

      menuOpen ? h('div', {
        className: 'nav-drawer-backdrop',
        onClick: () => setMenuOpen(false)
      },
        h('aside', {
          className: 'nav-drawer',
          dir: lang === 'ar' ? 'rtl' : 'ltr',
          onClick: e => e.stopPropagation(),
          'aria-label': lang === 'ar' ? 'قائمة الموقع' : 'Site Menu'
        },
          h('div', { className: 'nd-head' },
            h('div', { className: 'nd-brand', dir: 'ltr' },
              h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
              h('span', { className: 'nd-brand-name' }, t.brand || 'Syntax')),
            h('button', {
              type: 'button',
              className: 'nd-close',
              onClick: () => setMenuOpen(false),
              title: lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'
            }, h(CloseIcon))),

          h('div', { className: 'nd-section' },
            h('span', { className: 'nd-label' }, lang === 'ar' ? 'البحث السريع' : 'Quick Search'),
            h('button', {
              type: 'button',
              className: 'nd-search-trigger',
              onClick: () => {
                setMenuOpen(false);
                onOpenSearch();
              }
            },
              h(SearchIcon),
              h('span', { className: 'nd-search-text' }, lang === 'ar' ? 'ابحث في الكورسات والدروس والمصطلحات...' : 'Search courses, lessons, and terms...'),
              h('span', { className: 'nd-search-kbd', dir: 'ltr' }, 'Ctrl+K'))),

          h('div', { className: 'nd-section' },
            h('div', { className: 'nd-lang-row' },
              h('div', { className: 'nd-lang-info' },
                h(GlobeIcon),
                h('span', null, lang === 'ar' ? 'لغة المنصة' : 'Language')),
              h('div', { className: 'nd-lang-seg', dir: 'ltr' },
                h('button', {
                  type: 'button',
                  className: 'nd-lang-pill' + (lang === 'ar' ? ' active' : ''),
                  onClick: () => onSetLang('ar')
                }, 'AR'),
                h('button', {
                  type: 'button',
                  className: 'nd-lang-pill' + (lang === 'en' ? ' active' : ''),
                  onClick: () => onSetLang('en')
                }, 'EN')))),

          h('div', { className: 'nd-section' },
            h('span', { className: 'nd-label' }, t.coursesNav || (lang === 'ar' ? 'كورسات' : 'Courses')),
            h('div', { className: 'nd-nav-list' },
              h('a', {
                href: '#/',
                className: 'nd-nav-item' + (isHomeActive ? ' active' : ''),
                onClick: () => setMenuOpen(false)
              },
                h('span', { className: 'nd-nav-num' }, '00'),
                h('div', { className: 'nd-nav-text' },
                  h('strong', null, lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'),
                  h('span', null, lang === 'ar' ? 'نظرة عامة على المنصة والمسارات' : 'Platform overview & learning tracks'))),
              h('a', {
                href: '#/dashboard',
                className: 'nd-nav-item' + (isDashboardActive ? ' active' : ''),
                onClick: () => setMenuOpen(false)
              },
                h('span', { className: 'nd-nav-num' }, 'PRG'),
                h('div', { className: 'nd-nav-text' },
                  h('strong', null, lang === 'ar' ? 'لوحة التقدم والإحصائيات' : 'Student Progress Dashboard'),
                  h('span', null, lang === 'ar' ? 'تتبع الدروس المكتملة ودرجات الاختبارات ووقت التعلّم' : 'Track completed lessons, quiz scores & study time'))),
              h('a', {
                href: '#/courses',
                className: 'nd-nav-item' + (route.target === 'courses' ? ' active' : ''),
                onClick: () => setMenuOpen(false)
              },
                h('span', { className: 'nd-nav-num' }, 'ALL'),
                h('div', { className: 'nd-nav-text' },
                  h('strong', null, t.coursesNav || (lang === 'ar' ? 'كورسات' : 'Courses')),
                  h('span', null, lang === 'ar' ? 'تصفّح جميع الكورسات والمسارات البرمجية' : 'Browse all programming courses & tracks'))),
              COURSES_DATA.map((crs, idx) =>
                h('a', {
                  key: crs.id,
                  href: '#/course/' + crs.id,
                  className: 'nd-nav-item' + (route.name === 'course' && route.courseId === crs.id ? ' active' : ''),
                  style: { '--c-accent': crs.accent },
                  onClick: () => setMenuOpen(false)
                },
                  h('span', { className: 'nd-nav-num', style: { color: crs.accent } }, pad(idx + 1)),
                  h('div', { className: 'nd-nav-text' },
                    h('strong', null, lt(crs.title, lang)),
                    h('span', null, lt(crs.tag, lang))))
              ))),

          h('div', { className: 'nd-foot' },
            h('span', { className: 'nd-copy', dir: 'ltr' }, '© ' + new Date().getFullYear() + ' ' + (t.copyrightOwner || 'AborayaTechnologies')),
            h(MadeByMagedBadge, { className: 'nd-maged' }))
        )
      ) : null
    );
  }

  function Footer({ onOpenSearch }) {
    const { t, lang } = useLang();
    const isAr = lang === 'ar';

    const quickLinks = [
      { href: '#/', label: isAr ? 'الصفحة الرئيسية' : 'Home Overview', tag: '00' },
      { href: '#/courses', label: isAr ? 'كتالوج الكورسات' : 'Courses Catalog', tag: 'ALL' },
      { href: '#/course/students', label: isAr ? 'منهج الصف الثاني الثانوي (البكالوريا)' : '2nd Secondary Baccalaureate Track', tag: '14' },
      { href: '#/chapter/1', label: isAr ? 'الفصل 01: الذكاء الاصطناعي والأنظمة' : 'Chapter 01: AI & Computer Systems', tag: 'C1' },
      { href: '#/chapter/2', label: isAr ? 'الفصل 02: الأمن السيبراني والتشفير' : 'Chapter 02: Cybersecurity & Crypto', tag: 'C2' },
      { href: '#/chapter/3', label: isAr ? 'الفصل 03: هندسة الإنترنت وتطوير الويب' : 'Chapter 03: Internet & Web Engineering', tag: 'C3' },
      { href: '#/chapter/4', label: isAr ? 'الفصل 04: الوسائط الرقمية وتجربة المستخدم' : 'Chapter 04: Digital Media & UX Design', tag: 'C4' }
    ];

    const labLinks = [
      { href: '#/lesson/1-1', label: isAr ? 'محاكي قانون مور والترانزستورات' : "Moore's Law Transistor Simulator", badge: 'LAB 01' },
      { href: '#/lesson/2-1', label: isAr ? 'مختبر شفرة قيصر وقوة كلمة المرور' : 'Caesar Cipher & Password Entropy Lab', badge: 'LAB 02' },
      { href: '#/lesson/3-2', label: isAr ? 'محاكي طلبات واستجابات HTTP' : 'HTTP Client/Server Request Simulator', badge: 'LAB 03' },
      { href: '#/lesson/3-3', label: isAr ? 'محرر أكواد HTML و CSS و JS الفوري' : 'Live HTML / CSS / JS Code Sandbox', badge: 'LAB 04' },
      { href: '#/lesson/4-2', label: isAr ? 'فاحص تباين الألوان القياسي WCAG' : 'WCAG Accessibility Contrast Checker', badge: 'LAB 05' }
    ];

    const guidelines = [
      {
        num: '01',
        title: isAr ? 'التدرّج المنهجي المنظّم' : 'Sequential Lesson Mastery',
        desc: isAr
          ? 'ابدأ بقراءة أهداف الدرس والمصطلحات الأساسية قبل الانتقال إلى الشرح التفصيلي والأمثلة الواقعية.'
          : 'Read the lesson objectives and key terms first before diving into deep technical sections.'
      },
      {
        num: '02',
        title: isAr ? 'التجربة العملية داخل المحاكيات' : 'Hands-On Simulator Practice',
        desc: isAr
          ? 'جرّب تغيير القيم والأكواد بنفسك داخل المحاكيات التفاعلية المدمجة في كل فصل لتثبيت الفهم العملي.'
          : 'Manipulate variables and live code inside the interactive labs embedded across every chapter.'
      },
      {
        num: '03',
        title: isAr ? 'إتقان المصطلحات بالعربية والإنجليزية' : 'Bilingual Technical Vocabulary',
        desc: isAr
          ? 'استخدم البطاقات القابلة للقلب والترجمة المرافقة لربط المفاهيم البرمجية بمصطلحاتها القياسية العالمية.'
          : 'Use flip cards and bilingual companion notes to connect concepts with standard industry terms.'
      },
      {
        num: '04',
        title: isAr ? 'حل التمارين والاختبار الموقوت' : 'Exercises & Timed Quiz Check',
        desc: isAr
          ? 'اختبر فهمك بحل التمارين التطبيقية ثم اجتز الكويز الإلكتروني الموقوت قبل الانتقال للدرس التالي.'
          : 'Solve the practice prompts first, then complete the timed quiz before advancing to the next lesson.'
      }
    ];

    return h('footer', { className: 'ftr', 'data-reveal': '' },
      h('div', { className: 'ftr-in' },
        /* Top Neo-Brutalist Callout Banner */
        h('div', { className: 'ftr-top-banner' },
          h('div', { className: 'ftr-tb-left' },
            h('span', { className: 'ftr-tb-tag' }, isAr ? 'دليل الدراسة السريع' : 'STUDY PLAYBOOK'),
            h('h2', { className: 'ftr-tb-title' },
              isAr
                ? 'منصة تعليمية تفاعلية مصممة للفهم العميق والتطبيق العملي خطوة بخطوة.'
                : 'Built for deep technical comprehension, interactive experimentation, and exam readiness.'
            )
          ),
          h('div', { className: 'ftr-tb-actions' },
            h('a', { href: '#/course/students', className: 'solid ftr-cta-btn' },
              isAr ? 'ابدأ كورس البكالوريا الآن' : 'Open Baccalaureate Course',
              h('span', { className: 'arr', 'aria-hidden': 'true' }, '→')
            ),
            onOpenSearch ? h('button', {
              type: 'button',
              className: 'ghost ftr-search-btn',
              onClick: onOpenSearch
            },
              h(SearchIcon),
              h('span', null, isAr ? 'بحث سريع (Ctrl+K)' : 'Quick Search (Ctrl+K)')
            ) : null
          )
        ),

        /* Main 4-Column Blocky Grid */
        h('div', { className: 'ftr-grid' },
          /* Col 1: Brand + About + Social Media Links */
          h('div', { className: 'ftr-col ftr-col-brand' },
            h('a', { href: '#/', className: 'ftr-brand', dir: 'ltr' },
              h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
              h('span', { className: 'ftr-brand-name' }, t.brand || 'Syntax')
            ),
            h('p', { className: 'ftr-desc' },
              isAr
                ? 'منصة Syntax لتعليم البرمجة والذكاء الاصطناعي والأمن السيبراني وتطوير الويب لطلاب الصف الثاني الثانوي (البكالوريا) بشرح تفاعلي ومحاكي عملي لكل درس.'
                : 'Interactive computer science, AI, cybersecurity, and web engineering curriculum with live simulators, bilingual terminology, and timed assessments.'
            ),
            h('div', { className: 'ftr-social-block' },
              h('span', { className: 'ftr-col-kicker' }, isAr ? 'تواصل وتابع المطور (Maged)' : 'CONNECT & FOLLOW MAGED'),
              h('div', { className: 'ftr-social-list' },
                SOCIAL_LINKS.map(soc =>
                  h('a', {
                    key: soc.id,
                    href: soc.href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'ftr-social-card soc-' + soc.id,
                    dir: 'ltr'
                  },
                    h('span', { className: 'ftr-soc-icon' }, h(soc.icon)),
                    h('span', { className: 'ftr-soc-meta' },
                      h('strong', null, soc.label),
                      h('small', null, soc.handle)
                    ),
                    h('span', { className: 'ftr-soc-ext', 'aria-hidden': 'true' }, h(ArrowUpRightIcon))
                  )
                )
              )
            )
          ),

          /* Col 2: Quick Navigation & Curriculum Chapters */
          h('div', { className: 'ftr-col' },
            h('h3', { className: 'ftr-col-title' }, isAr ? 'روابط المنصة والفصول' : 'Navigation & Chapters'),
            h('ul', { className: 'ftr-link-list' },
              quickLinks.map((item, i) =>
                h('li', { key: i },
                  h('a', { href: item.href, className: 'ftr-link-item' },
                    h('span', { className: 'ftr-link-tag', dir: 'ltr' }, item.tag),
                    h('span', { className: 'ftr-link-txt' }, item.label)
                  )
                )
              )
            )
          ),

          /* Col 3: Interactive Simulators & Labs */
          h('div', { className: 'ftr-col' },
            h('h3', { className: 'ftr-col-title' }, isAr ? 'المختبرات والمحاكيات التفاعلية' : 'Interactive Simulators'),
            h('ul', { className: 'ftr-link-list' },
              labLinks.map((lab, i) =>
                h('li', { key: i },
                  h('a', {
                    href: lab.href,
                    className: 'ftr-link-item is-lab',
                    onMouseEnter: () => {
                      const m = lab.href.match(/lesson\/(\d-\d)/);
                      if (m && App.prefetchLesson) App.prefetchLesson(m[1], lang);
                    }
                  },
                    h('span', { className: 'ftr-link-tag lab-tag', dir: 'ltr' }, lab.badge),
                    h('span', { className: 'ftr-link-txt' }, lab.label)
                  )
                )
              )
            )
          ),

          /* Col 4: Study Guidelines */
          h('div', { className: 'ftr-col ftr-col-guidelines' },
            h('h3', { className: 'ftr-col-title' }, isAr ? 'إرشادات الدراسة والتحصيل' : 'Study Guidelines & Rules'),
            h('div', { className: 'ftr-guidelines-list' },
              guidelines.map(g =>
                h('div', { key: g.num, className: 'ftr-guide-card' },
                  h('span', { className: 'ftr-guide-num', dir: 'ltr' }, g.num),
                  h('div', { className: 'ftr-guide-body' },
                    h('strong', null, g.title),
                    h('p', null, g.desc)
                  )
                )
              )
            )
          )
        ),

        /* Bottom Bar: Dual Copyrights */
        h('div', { className: 'ftr-bottom' },
          h('div', { className: 'ftr-copy-group' },
            h('p', { className: 'copy' },
              h('bdi', { dir: 'ltr' }, '© ' + new Date().getFullYear() + ' ' + (t.copyrightOwner || 'AborayaTechnologies')),
              ' · ',
              t.footerRights || (isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'),
              '.'
            ),
            h('div', { className: 'ftr-made-by' },
              h(MadeByMagedBadge)
            )
          ),
          h('div', { className: 'ftr-bottom-social-strip', dir: 'ltr' },
            SOCIAL_LINKS.map(soc =>
              h('a', {
                key: soc.id,
                href: soc.href,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'ftr-mini-soc',
                title: soc.label + ' (' + soc.handle + ')'
              },
                h(soc.icon),
                h('span', null, soc.label)
              )
            )
          )
        )
      )
    );
  }

  /* ============ marquee ============ */
  const TERMS_EN = ['Artificial Intelligence', 'Machine Learning', 'Encryption', 'Firewall', 'HTTP', 'HTML', 'CSS', 'JavaScript', 'User Experience', 'Moore’s Law', 'Authentication', 'Responsive Design'];
  const TERMS_AR = ['الذكاء الاصطناعي · AI', 'تعلّم الآلة · ML', 'التشفير والأمان', 'جدار الحماية · Firewall', 'بروتوكول HTTP', 'هيكلة HTML5', 'تنسيقات CSS3', 'برمجة JavaScript', 'تجربة المستخدم · UX', 'قانون مور · Moore’s Law', 'المصادقة متعددة العوامل', 'التصميم المتجاوب'];
  function Marquee() {
    const { lang } = useLang();
    const track = useRef(null);
    useEffect(() => {
      if (App.reduced) return;
      const tw = gsap.to(track.current, { xPercent: -50, repeat: -1, duration: 38, ease: 'none' });
      const st = ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: s => {
          const v = Math.min(Math.abs(s.getVelocity()) / 260, 6);
          gsap.to(tw, { timeScale: 1 + v, duration: .25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1.2 }) });
        }
      });
      return () => { st.kill(); tw.kill(); };
    }, []);
    const base = lang === 'ar' ? TERMS_AR : TERMS_EN;
    const row = base.concat(base);
    return h('div', { className: 'marquee', 'aria-hidden': 'true', dir: 'ltr' },
      h('div', { className: 'mq-track', ref: track }, row.concat(row).map((s, i) => h('span', { key: i }, s, h('i')))));
  }

  /* ============ chapter panels & courses ============ */
  const CH_PREVIEWS = {
    1: [
      { img: './assets/img/lessons/gordon_moore.png', name: 'Gordon Moore', ar: 'جوردون مور' },
      { img: './assets/img/lessons/eniac.jpg', name: 'ENIAC (1945)', ar: 'حاسوب إينياك (1945)' },
      { img: './assets/img/lessons/intel_4004.jpg', name: 'Intel 4004', ar: 'معالج إنتل 4004' },
      { img: './assets/img/lessons/alan_turing.jpg', name: 'Alan Turing', ar: 'آلان تورينج' },
      { img: './assets/img/lessons/self_driving.jpg', name: 'Waymo Car', ar: 'سيارة وايمو الذاتية' }
    ],
    2: [
      { img: './assets/img/lessons/julius_caesar.jpg', name: 'Julius Caesar', ar: 'يوليوس قيصر' },
      { img: './assets/img/lessons/enigma.jpg', name: 'Enigma', ar: 'آلة إنجما للتشفير' },
      { img: './assets/img/lessons/firewall.png', name: 'Firewall', ar: 'الجدار الناري' },
      { img: './assets/img/lessons/yubikey.jpg', name: 'YubiKey 2FA', ar: 'مفتاح الأمان YubiKey' },
      { img: './assets/img/lessons/soc.jpg', name: 'Cyber SOC', ar: 'مركز العمليات الأمنية' }
    ],
    3: [
      { img: './assets/img/lessons/tim_berners_lee.jpg', name: 'Tim Berners-Lee', ar: 'تيم بيرنرز لي' },
      { img: './assets/img/lessons/next_computer.jpg', name: 'First Web Server', ar: 'أول خادم ويب (NeXT)' },
      { img: './assets/img/lessons/submarine_cable.png', name: 'Submarine Cable', ar: 'كابل الإنترنت البحري' },
      { img: './assets/img/lessons/brendan_eich.jpg', name: 'Brendan Eich', ar: 'بريندان آيك (JS)' },
      { img: './assets/img/lessons/hakon_lie.jpg', name: 'Håkon Wium Lie', ar: 'هاكون فيوم لي (CSS)' }
    ],
    4: [
      { img: './assets/img/lessons/rgb_pixels.jpg', name: 'RGB Pixels', ar: 'بكسلات الشاشة RGB' },
      { img: './assets/img/lessons/don_norman.jpg', name: 'Don Norman', ar: 'دون نورمان (UX)' },
      { img: './assets/img/lessons/wireframe.png', name: 'Wireframe', ar: 'المخطط السلكي' },
      { img: './assets/img/lessons/braille_display.jpg', name: 'Braille Display', ar: 'سطر برايل الإلكتروني' },
      { img: './assets/img/lessons/jakob_nielsen.jpg', name: 'Jakob Nielsen', ar: 'ياكوب نيلسن' }
    ]
  };

  function ChapterPanel({ c, idx, status, lang, t, store }) {
    const lessons = c.lessons;
    const doneN = lessons.filter(l => (store.lessons || {})[l.id] && store.lessons[l.id].best != null).length;
    const ready = id => !status || (status[lang] || []).includes(id);
    const isEn = lang === 'en';

    return h('section', { className: 'panel', id: 'chapter-' + c.id, style: { '--accent': c.accent }, 'data-idx': idx },
      h('div', { className: 'panel-in' },
        h('div', { className: 'panel-main' },
          h('div', { className: 'panel-kicker-row' },
            h('span', { className: 'panel-badge-num', dir: 'ltr' }, `CH ${pad(c.id)}`),
            h('p', { className: 'kicker' }, `${t.chapter} ${pad(c.id)} · ${lessons.length} ${t.lessons}`)
          ),
          h(Words, { tag: 'h2', className: 'panel-title', text: lt(c.title, lang) }),
          isEn ? h('span', { className: 'ar-sub-title', dir: 'rtl' }, c.title.ar) : null,
          h('p', { className: 'panel-blurb', 'data-reveal': '' }, lt(c.blurb, lang)),
          isEn ? h('p', { className: 'ar-sub', dir: 'rtl', style: { margin: '8px 0 16px' } }, c.blurb.ar) : null,
          h('div', { className: 'panel-prog', 'data-reveal': '' }, h('i', null, h('b', { style: { width: (doneN / lessons.length * 100) + '%' } })), h('span', { dir: 'ltr' }, `${doneN} / ${lessons.length}`)),
          h('div', { className: 'panel-gallery-strip', 'data-reveal': '' },
            h('span', { className: 'pgs-label' }, isEn ? 'Pioneers & Real Hardware in this chapter:' : 'شخصيات رائدة وأجهزة حقيقية في هذا الفصل:'),
            h('div', { className: 'pgs-items' },
              (CH_PREVIEWS[c.id] || []).map((p, k) => {
                const label = isEn ? p.name : (p.ar || p.name);
                return h('div', { key: k, className: 'pgs-item', title: label },
                  h('img', { src: p.img, alt: label, loading: 'lazy' }),
                  h('span', null, label));
              })))),
        h('ol', { className: 'lesson-list', 'data-stagger': '' },
          lessons.map((l, i) => {
            const st = (store.lessons || {})[l.id] || {};
            const isDone = st.best != null;
            const ok = ready(l.id);
            return h('li', { key: l.id },
              h('a', {
                className: 'lrow' + (ok ? '' : ' off'),
                href: ok ? '#/lesson/' + l.id : undefined,
                'aria-disabled': !ok,
                onMouseEnter: () => ok && App.prefetchLesson && App.prefetchLesson(l.id, lang)
              },
                h('span', { className: 'lrow-n' }, `${c.id}.${i + 1}`),
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 } },
                  h('span', { className: 'lrow-t' }, lt(l.title, lang)),
                  isEn ? h('span', { className: 'ar-row-sub', dir: 'rtl' }, l.title.ar) : null),
                h('span', { className: 'lrow-m' }, `${l.minutes} ${t.min}`),
                h('span', { className: 'lrow-s' + (isDone ? ' done' : '') }, !ok ? t.notReady : isDone ? `${st.best}/${st.total || 9}` : (st.read ? t.cont : t.start)),
                h('span', { className: 'lrow-a', 'aria-hidden': 'true' }, '→')));
          })),
        null));
  }

  /* ============ Custom Video Player ============ */
  function extractYouTubeEmbed(url) {
    if (!url) return null;
    const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
  }

  function CustomVideoPlayer({ title, src, duration: initialDuration = 152 }) {
    const { lang } = useLang();
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(initialDuration || 152);
    const [volume, setVolume] = useState(1);
    const [rate, setRate] = useState(1);
    const [quality, setQuality] = useState('720p');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsView, setSettingsView] = useState('main'); // main | speed | quality
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const settingsRef = useRef(null);

    const ytEmbed = extractYouTubeEmbed(src);
    const hasCustomVideo = Boolean(src && !String(src).includes('BigBuckBunny.mp4') && !ytEmbed);

    const slides = useMemo(() => {
      const isAr = lang === 'ar';
      return [
        {
          step: '01',
          tag: isAr ? 'مقدمة المحاضرة' : 'LECTURE OVERVIEW',
          heading: title || (isAr ? 'مقدمة الكورس وخطة الدراسة' : 'Course & Lesson Overview'),
          points: isAr
            ? ['فهم الفكرة الأساسية والمفاهيم الهندسية خطوة بخطوة', 'ربط النظرية بالتطبيق العملي والأجهزة الحقيقية', 'الاستعداد لحل أسئلة الواجب والكويز الإلكتروني الموقوت']
            : ['Master core engineering concepts step by step', 'Connect theory to real hardware and live code', 'Prepare for hands-on exercises and timed quizzes']
        },
        {
          step: '02',
          tag: isAr ? 'المفاهيم الأساسية' : 'KEY ARCHITECTURE',
          heading: isAr ? 'تحليل الأنظمة والخوارزميات' : 'System Architecture & Logic',
          points: isAr
            ? ['استكشاف المصطلحات التقنية باللغتين العربية والإنجليزية', 'مقارنة الحلول البرمجية وتحليل الأداء والأمان', 'أمثلة واقعية من أنظمة الذكاء الاصطناعي والشبكات']
            : ['Explore technical terminology in Arabic & English', 'Compare engineering trade-offs, security, and speed', 'Real-world case studies from AI and network systems']
        },
        {
          step: '03',
          tag: isAr ? 'التطبيق العملي' : 'INTERACTIVE LAB',
          heading: isAr ? 'التجربة داخل المحاكي التفاعلي' : 'Hands-On Simulator Walkthrough',
          points: isAr
            ? ['تعديل المدخلات وملاحظة النتائج الفورية داخل المتصفح', 'تطبيق القواعد الحسابية والبرمجية بدون تعقيد', 'تثبيت المعلومة من خلال التجربة المباشرة']
            : ['Modify inputs and inspect real-time outputs in-browser', 'Apply computational rules and code interactively', 'Reinforce retention through direct experimentation']
        },
        {
          step: '04',
          tag: isAr ? 'الخلاصة والاختبار' : 'SUMMARY & QUIZ',
          heading: isAr ? 'مراجعة النقاط الحاسمة قبل الكويز' : 'Final Recap & Quiz Readiness',
          points: isAr
            ? ['مراجعة ملخص الدرس السريع وحل التمارين التدريبية', 'التأكد من إتقان جميع أهداف الدرس قبل بدء الاختبار', 'اجتياز الكويز الموقوت لتسجيل تقدمك في الفصول']
            : ['Review the lesson recap and practice exercises', 'Verify mastery of all learning objectives', 'Complete the timed quiz to record your score']
        }
      ];
    }, [title, lang]);

    useEffect(() => {
      if (hasCustomVideo || ytEmbed || !playing) return;
      const iv = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.25 * rate;
          if (next >= duration) {
            setPlaying(false);
            return duration;
          }
          return next;
        });
      }, 250);
      return () => clearInterval(iv);
    }, [playing, hasCustomVideo, ytEmbed, rate, duration]);

    useEffect(() => {
      if (!settingsOpen) return;
      const onDoc = e => {
        if (settingsRef.current && !settingsRef.current.contains(e.target)) {
          setSettingsOpen(false);
          setSettingsView('main');
        }
      };
      document.addEventListener('pointerdown', onDoc);
      return () => document.removeEventListener('pointerdown', onDoc);
    }, [settingsOpen]);

    const formatTime = (secs) => {
      const s = Math.max(0, Math.floor(secs || 0));
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return `${m < 10 ? '0' : ''}${m}:${rem < 10 ? '0' : ''}${rem}`;
    };

    const togglePlay = () => {
      if (hasCustomVideo && videoRef.current) {
        if (playing) {
          videoRef.current.pause();
          setPlaying(false);
        } else {
          videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
        return;
      }
      setPlaying(prev => {
        if (!prev && currentTime >= duration) setCurrentTime(0);
        return !prev;
      });
    };

    const skip = (delta) => {
      const maxDur = duration || 152;
      const base = (hasCustomVideo && videoRef.current) ? videoRef.current.currentTime : currentTime;
      const target = Math.max(0, Math.min(maxDur, base + delta));
      if (hasCustomVideo && videoRef.current) videoRef.current.currentTime = target;
      setCurrentTime(target);
    };

    const handleSeek = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width || 1)));
      const maxDur = duration || 152;
      const target = pos * maxDur;
      if (hasCustomVideo && videoRef.current) videoRef.current.currentTime = target;
      setCurrentTime(target);
    };

    const selectRate = (nextRate) => {
      setRate(nextRate);
      if (hasCustomVideo && videoRef.current) videoRef.current.playbackRate = nextRate;
      setSettingsView('main');
      setSettingsOpen(false);
    };

    const toggleFullscreen = () => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    };

    const RewindSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('polyline', { points: '11 17 6 12 11 7' }),
      h('polyline', { points: '18 17 13 12 18 7' }));

    const ForwardSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('polyline', { points: '13 17 18 12 13 7' }),
      h('polyline', { points: '6 17 11 12 6 7' }));

    const VolumeOnSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
      h('path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' }),
      h('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14' }));

    const VolumeOffSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
      h('line', { x1: 23, y1: 9, x2: 17, y2: 15 }),
      h('line', { x1: 17, y1: 9, x2: 23, y2: 15 }));

    const GearSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' }));

    const FullscreenSvg = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' }));

    const pct = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));
    const slideIdx = Math.min(slides.length - 1, Math.floor((pct / 100) * slides.length));
    const activeSlide = slides[slideIdx] || slides[0];

    return h('div', { className: 'custom-video-player', ref: containerRef },
      ytEmbed ? h('div', { className: 'cvp-stage' },
        h('iframe', {
          className: 'cvp-video-el',
          src: ytEmbed,
          title: title || 'Lesson Video',
          frameBorder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
          style: { width: '100%', height: '100%', border: 0 }
        })
      ) : h('div', { className: 'cvp-stage' },
        hasCustomVideo ? h('video', {
          ref: videoRef,
          className: 'cvp-video-el',
          src,
          preload: 'none',
          onLoadedMetadata: () => {
            if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
              setDuration(videoRef.current.duration);
            }
          },
          onTimeUpdate: () => videoRef.current && setCurrentTime(videoRef.current.currentTime),
          onPlay: () => setPlaying(true),
          onPause: () => setPlaying(false),
          onEnded: () => setPlaying(false),
          playsInline: true,
          onClick: togglePlay
        }) : h('div', {
          className: 'cvp-lecture-board' + (playing ? ' is-playing' : ''),
          dir: lang === 'ar' ? 'rtl' : 'ltr',
          onClick: togglePlay
        },
          h('div', { className: 'cvp-lb-top' },
            h('span', { className: 'cvp-lb-badge' }, activeSlide.tag),
            h('div', { className: 'cvp-lb-steps', dir: 'ltr', onClick: e => e.stopPropagation() },
              slides.map((s, idx) =>
                h('button', {
                  key: s.step,
                  type: 'button',
                  className: 'cvp-lb-step-btn' + (idx === slideIdx ? ' active' : ''),
                  onClick: () => {
                    const target = ((idx + 0.1) / slides.length) * (duration || 152);
                    setCurrentTime(target);
                  }
                }, s.step)
              )
            )
          ),
          h('div', { className: 'cvp-lb-main' },
            h('h3', { className: 'cvp-lb-title' }, activeSlide.heading),
            h('ul', { className: 'cvp-lb-list' },
              activeSlide.points.map((pt, i) =>
                h('li', { key: i },
                  h('span', { className: 'cvp-lb-bullet', dir: 'ltr' }, `0${i + 1}`),
                  h('span', null, pt)
                )
              )
            )
          )
        ),
        !playing ? h('button', {
          type: 'button',
          className: 'cvp-overlay-play-btn',
          onClick: togglePlay,
          'aria-label': lang === 'ar' ? 'تشغيل الشرح التفاعلي' : 'Play interactive overview'
        },
          h('svg', { width: 30, height: 30, viewBox: '0 0 24 24', fill: '#111111', style: { marginLeft: '3px' } },
            h('polygon', { points: '6 3 20 12 6 21 6 3' }))
        ) : null,

        settingsOpen ? h('div', { className: 'cvp-settings-menu', ref: settingsRef, dir: 'ltr', onClick: e => e.stopPropagation() },
          settingsView === 'main' ? h(React.Fragment, null,
            h('div', { className: 'cvp-sm-header' }, 'Settings'),
            h('button', { type: 'button', className: 'cvp-sm-row', onClick: () => setSettingsView('quality') },
              h('span', { className: 'cvp-sm-label' }, 'Quality'),
              h('span', { className: 'cvp-sm-val' }, quality + ' ›')
            ),
            h('button', { type: 'button', className: 'cvp-sm-row', onClick: () => setSettingsView('speed') },
              h('span', { className: 'cvp-sm-label' }, 'Playback Speed'),
              h('span', { className: 'cvp-sm-val' }, (rate === 1 ? 'Normal' : rate + 'x') + ' ›')
            )
          ) : settingsView === 'speed' ? h(React.Fragment, null,
            h('button', { type: 'button', className: 'cvp-sm-header cvp-sm-back', onClick: () => setSettingsView('main') }, '‹ Playback Speed'),
            [0.75, 1, 1.25, 1.5, 2].map(r =>
              h('button', {
                key: r,
                type: 'button',
                className: 'cvp-sm-row' + (rate === r ? ' is-selected' : ''),
                onClick: () => selectRate(r)
              },
                h('span', { className: 'cvp-sm-label' }, r === 1 ? 'Normal' : r + 'x'),
                rate === r ? h('span', { className: 'cvp-sm-val' }, '✓') : null
              )
            )
          ) : h(React.Fragment, null,
            h('button', { type: 'button', className: 'cvp-sm-header cvp-sm-back', onClick: () => setSettingsView('main') }, '‹ Quality'),
            ['1080p', '720p', '480p', 'Auto'].map(q =>
              h('button', {
                key: q,
                type: 'button',
                className: 'cvp-sm-row' + (quality === q ? ' is-selected' : ''),
                onClick: () => { setQuality(q); setSettingsView('main'); setSettingsOpen(false); }
              },
                h('span', { className: 'cvp-sm-label' }, q),
                quality === q ? h('span', { className: 'cvp-sm-val' }, '✓') : null
              )
            )
          )
        ) : null,

        h('div', { className: 'cvp-controls', dir: 'ltr' },
          h('div', { className: 'cvp-scrub-wrap', onClick: handleSeek },
            h('div', { className: 'cvp-scrub-track' },
              h('div', { className: 'cvp-scrub-fill', style: { width: `${pct}%` } }),
              h('span', { className: 'cvp-scrub-thumb', style: { left: `${pct}%` } })
            )
          ),
          h('div', { className: 'cvp-controls-row' },
            h('div', { className: 'cvp-ctrl-left' },
              h('button', { type: 'button', className: 'cvp-btn', onClick: () => skip(-10), title: 'Rewind 10s' }, h(RewindSvg)),
              h('button', { type: 'button', className: 'cvp-btn cvp-play-btn', onClick: togglePlay, title: playing ? 'Pause' : 'Play' },
                playing
                  ? h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'currentColor' },
                    h('rect', { x: 6, y: 4, width: 4, height: 16 }),
                    h('rect', { x: 14, y: 4, width: 4, height: 16 }))
                  : h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'currentColor' },
                    h('polygon', { points: '6 3 20 12 6 21 6 3' }))
              ),
              h('button', { type: 'button', className: 'cvp-btn', onClick: () => skip(10), title: 'Forward 10s' }, h(ForwardSvg)),
              h('span', { className: 'cvp-time-display', dir: 'ltr' }, `${formatTime(currentTime)} / ${formatTime(duration)}`),
              h('button', {
                type: 'button',
                className: 'cvp-btn cvp-vol-btn',
                onClick: () => {
                  const next = volume === 0 ? 1 : 0;
                  setVolume(next);
                  if (videoRef.current) videoRef.current.volume = next;
                },
                title: volume > 0 ? 'Mute' : 'Unmute'
              }, volume > 0 ? h(VolumeOnSvg) : h(VolumeOffSvg))
            ),
            h('div', { className: 'cvp-ctrl-right' },
              h('button', {
                type: 'button',
                className: 'cvp-btn',
                onClick: () => { setSettingsOpen(prev => !prev); setSettingsView('main'); },
                title: 'Settings'
              }, h(GearSvg)),
              h('button', { type: 'button', className: 'cvp-btn cvp-fs-btn', onClick: toggleFullscreen, title: 'Fullscreen' }, h(FullscreenSvg))
            )
          )
        )
      )
    );
  }

  /* ============ Courses Catalog Section on Home ============ */
  function CoursesCatalog({ meta, store, lang, t }) {
    const [ratingSnap, setRatingSnap] = useState(() => App.StoreRatings.getCourse('students'));
    useEffect(() => {
      return App.StoreRatings.subscribe(() => {
        setRatingSnap(App.StoreRatings.getCourse('students'));
      });
    }, []);

    return h('section', { className: 'courses-sec', id: 'courses' },
      h('div', { className: 'courses-head' },
        h('p', { className: 'kicker', 'data-reveal': '' }, (t && t.coursesKicker) || 'Syntax'),
        h(Words, { tag: 'h2', className: 'section-title', text: (t && t.coursesTitle) || (lang === 'ar' ? 'كورسات Syntax' : 'Syntax Courses') }),
        h('p', { className: 'courses-sub', 'data-reveal': '' },
          (t && t.coursesSub) || (lang === 'ar'
            ? 'اتعلم البرمجة وتطوير الويب والذكاء الاصطناعي والأمن السيبراني وحاجات تانية كتير.'
            : 'Learn programming, web development, artificial intelligence, cybersecurity, and much more.'))
      ),
      h('div', { className: 'courses-grid', 'data-stagger': '' },
        COURSES_DATA.map((crs) => {
          const avgDisplay = ratingSnap.count > 0 ? ratingSnap.average.toFixed(1) : '0';
          const studentsDisplay = lang === 'ar'
            ? `${ratingSnap.studentsCount || 0} طالب`
            : `${ratingSnap.studentsCount || 0} students`;
          return h('a', {
            key: crs.id,
            href: '#/course/' + crs.id,
            className: 'course-card',
            style: { '--c-accent': crs.accent }
          },
            h('div', { className: 'cc-banner' },
              h('img', {
                src: crs.image || './assets/img/lessons/alan_turing.jpg',
                alt: lt(crs.title, lang),
                loading: 'lazy'
              })
            ),
            h('div', { className: 'cc-body' },
              h('div', { className: 'cc-category' }, lt(crs.tag, lang)),
              h('h3', { className: 'cc-title' }, lt(crs.title, lang)),
              h('p', { className: 'cc-blurb' }, lt(crs.blurb, lang)),
              h('div', { className: 'cc-rating' },
                h('span', { className: 'cc-star' }, '★'),
                h('span', { className: 'cc-score' }, avgDisplay),
                h('span', { className: 'cc-count' }, `(${studentsDisplay})`)
              )
            ),
            h('div', { className: 'cc-bottom' },
              h('span', { className: 'cc-btn-solid' }, lang === 'ar' ? 'شوف محتوى الكورس ←' : 'Explore Course →'),
              h('span', { className: 'cc-price-txt' }, lt(crs.priceText, lang) || (lang === 'ar' ? 'مجاني' : 'Free'))
            )
          );
        })
      )
    );
  }

  /* ============ Dedicated Course Intro View ============ */
  function CourseView({ courseId, targetChapter, meta, status }) {
    const { t, lang } = useLang();
    const store = useStore();
    useScan();

    const course = useMemo(() => COURSES_DATA.find(c => c.id === courseId) || COURSES_DATA[0], [courseId]);
    const chapters = useMemo(() => {
      if (!meta) return [];
      return meta.chapters.filter(c => course.chapterIds.includes(c.id));
    }, [meta, course]);

    const [openChapters, setOpenChapters] = useState(() => {
      if (targetChapter) return { [targetChapter]: true };
      return { 1: true };
    });

    useEffect(() => {
      if (targetChapter) {
        setOpenChapters(prev => ({ ...prev, [targetChapter]: true }));
        const timer = setTimeout(() => {
          const el = document.getElementById('cip-chapter-' + targetChapter);
          if (el) scrollToEl(el, 90);
        }, 120);
        return () => clearTimeout(timer);
      }
    }, [targetChapter, meta]);

    const toggleChapter = (chId) => {
      setOpenChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
    };

    const allExpanded = chapters.length > 0 && chapters.every(ch => !!openChapters[ch.id]);
    const toggleAllChapters = () => {
      if (allExpanded) {
        setOpenChapters({});
      } else {
        const next = {};
        chapters.forEach(ch => { next[ch.id] = true; });
        setOpenChapters(next);
      }
    };

    const [ratingInfo, setRatingInfo] = useState(() => App.StoreRatings.getCourse(course.id));
    const [hoverStar, setHoverStar] = useState(0);
    const [ratingSavedNotice, setRatingSavedNotice] = useState(false);

    useEffect(() => {
      App.StoreRatings.load(course.id);
      return App.StoreRatings.subscribe(() => {
        setRatingInfo(App.StoreRatings.getCourse(course.id));
      });
    }, [course.id]);

    const handleRate = async (stars) => {
      await App.StoreRatings.rate(course.id, stars);
      setRatingInfo(App.StoreRatings.getCourse(course.id));
      setRatingSavedNotice(true);
      setTimeout(() => setRatingSavedNotice(false), 2500);
    };

    const totalLessons = chapters.reduce((n, c) => n + c.lessons.length, 0) || 14;
    const firstLessonId = chapters.length && chapters[0].lessons.length ? chapters[0].lessons[0].id : '1-1';

    const learnItemsAr = [
      'فيديوهات شرح لكل درس هنفهم فيها كل حاجة وهنحل كتيير',
      'ملازم الحصة والواجب لكل درس',
      'واجب الكتروني بعد كل حصة',
      'فيديو حل الواجب بالتفصيل + المودل انسر',
      'كويز الكتروني بوقت بعد كل حصة عشان نضمن انك فهمت الدرس كويس وبتعرف تحل عليه'
    ];

    const learnItemsEn = [
      'Detailed video explanations for every lesson where we understand everything and solve plenty of problems',
      'Study notes and homework handouts for every lesson',
      'Electronic homework assignment after every class',
      'Detailed homework solution video + model answer',
      'Timed electronic quiz after every class to ensure you understood the lesson and can solve problems on it'
    ];

    const learnList = lang === 'ar' ? learnItemsAr : learnItemsEn;
    const avgScoreStr = ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : '0';

    return h('main', { id: 'main', className: 'course-intro-view' },
      /* 1. Breadcrumb */
      h('nav', { className: 'cip-breadcrumb', 'aria-label': 'Breadcrumb' },
        h('a', { href: '#/' }, lang === 'ar' ? 'الرئيسية' : 'Home'),
        h('span', null, '/'),
        h('a', { href: '#/courses' }, lang === 'ar' ? 'الكورسات' : 'Courses'),
        h('span', null, '/'),
        h('span', { style: { color: '#000000', fontWeight: 700 } }, lt(course.title, lang))
      ),

      /* 2. Course Header */
      h('header', { className: 'cip-header' },
        h('h1', { className: 'cip-title' }, lt(course.title, lang)),
        h('p', { className: 'cip-sub' }, lt(course.blurb, lang)),
        h('div', { className: 'cip-meta-strip' },
          h('span', { className: 'cip-meta-rating-pill' },
            `★ ${avgScoreStr} (${ratingInfo.count} ${lang === 'ar' ? 'تقييم' : 'ratings'})`
          ),
          h('span', null, '•'),
          h('span', null, `${ratingInfo.studentsCount || 0} ${lang === 'ar' ? 'طالب' : 'students'}`),
          h('span', null, '•'),
          h('span', null, `${totalLessons} ${lang === 'ar' ? 'درس' : 'lessons'}`),
          h('span', null, '•'),
          h('span', { style: { color: '#16a34a', fontWeight: 800 } }, lang === 'ar' ? 'مجاني' : 'Free')
        ),

        /* Student Interactive Rating Bar */
        h('div', { className: 'cip-student-rating-box' },
          h('span', { className: 'cip-sr-label' },
            ratingInfo.myRating > 0
              ? (lang === 'ar' ? `تقييمك للكورس (${ratingInfo.myRating}/5):` : `Your course rating (${ratingInfo.myRating}/5):`)
              : (lang === 'ar' ? 'قيّم الكورس:' : 'Rate this course:')
          ),
          h('div', {
            className: 'cip-sr-stars',
            onMouseLeave: () => setHoverStar(0)
          },
            [1, 2, 3, 4, 5].map(stNum => {
              const active = (hoverStar || ratingInfo.myRating) >= stNum;
              return h('button', {
                key: stNum,
                type: 'button',
                className: 'cip-sr-star-btn' + (active ? ' is-lit' : ''),
                onMouseEnter: () => setHoverStar(stNum),
                onClick: () => handleRate(stNum),
                title: lang === 'ar' ? `تقييم ${stNum} من 5` : `Rate ${stNum} of 5`,
                'aria-label': lang === 'ar' ? `تقييم ${stNum} من 5` : `Rate ${stNum} of 5`
              }, '★');
            })
          ),
          ratingSavedNotice ? h('span', { className: 'cip-sr-saved' },
            lang === 'ar' ? 'تم تسجيل تقييمك بنجاح' : 'Rating saved'
          ) : null
        )
      ),

      /* 3. 2-Column Layout */
      h('div', { className: 'cip-layout' },
        /* Main Column */
        h('div', { className: 'cip-main' },
          /* Custom Video Player */
          h(CustomVideoPlayer, {
            title: lang === 'ar' ? 'مقدمة الكورس وخطة الدراسة' : 'Course Introduction & Study Plan',
            src: '',
            duration: 152
          }),

          /* Section: Course Description & What You Will Find */
          h('div', { className: 'cip-card' },
            h('div', { className: 'cip-welcome-block' },
              h('p', { className: 'cip-welcome-greeting' }, lang === 'ar' ? 'اهلا يا بشمهندسين' : 'Welcome Engineers'),
              h('p', { className: 'cip-welcome-course' },
                lang === 'ar'
                  ? 'كورس البرمجة والذكاء الاصطناعي ان شاء الله للصف الثاني الثانوي - البكالوريا'
                  : 'Programming & Artificial Intelligence Course for 2nd Secondary - Baccalaureate'
              ),
              h('h2', { className: 'cip-card-title', style: { marginTop: '6px' } },
                lang === 'ar' ? 'طيب هنلاقي ايه في الكورس ده ؟' : 'What will we find in this course?'
              )
            ),
            h('div', { className: 'cip-learn-list' },
              learnList.map((item, idx) =>
                h('div', { key: idx, className: 'cip-learn-item' },
                  h('span', { className: 'cip-check' }, '✓'),
                  h('span', null, item)
                )
              )
            ),
            h('div', { className: 'cip-quiz-rule-note' },
              lang === 'ar'
                ? 'عشان تضمن انك فهمت الاول حل الكويز بعدين خش على اللي بعده'
                : 'To make sure you understood first, solve the quiz and then move on to the next lesson'
            )
          ),

          /* Section: Collapsible Curriculum Categories */
          h('div', { className: 'cip-card' },
            h('div', { className: 'cip-curr-top-row' },
              h('h2', { className: 'cip-card-title' },
                lang === 'ar' ? 'منهج الكورس وقائمة الدروس' : 'Curriculum & Course Content'
              ),
              h('button', {
                type: 'button',
                className: 'cip-expand-all-btn',
                onClick: toggleAllChapters
              }, allExpanded
                ? (lang === 'ar' ? 'إغلاق الكل' : 'Collapse All')
                : (lang === 'ar' ? 'فتح الكل' : 'Expand All'))
            ),
            h('div', { className: 'cip-curriculum-list' },
              chapters.map((ch) => {
                const isOpen = !!openChapters[ch.id];
                const doneInCh = ch.lessons.filter(ls => (store.lessons || {})[ls.id] && store.lessons[ls.id].best != null).length;
                return h('div', {
                  key: ch.id,
                  id: 'cip-chapter-' + ch.id,
                  className: 'cip-chapter-box' + (isOpen ? ' is-open' : '')
                },
                  h('button', {
                    type: 'button',
                    className: 'cip-ch-head',
                    onClick: () => toggleChapter(ch.id),
                    'aria-expanded': isOpen
                  },
                    h('div', { className: 'cip-ch-head-title' },
                      h('span', { className: 'cip-ch-num-pill' }, pad(ch.id)),
                      h('span', null, `${lang === 'ar' ? 'الفصل' : 'Chapter'} ${pad(ch.id)}: ${lt(ch.title, lang)}`)
                    ),
                    h('div', { className: 'cip-ch-head-meta' },
                      h('span', { className: 'cip-ch-count' },
                        doneInCh > 0
                          ? `${doneInCh}/${ch.lessons.length} ${lang === 'ar' ? 'مكتمل' : 'done'}`
                          : `${ch.lessons.length} ${lang === 'ar' ? 'دروس' : 'lessons'}`
                      ),
                      h('svg', {
                        className: 'cip-ch-chevron',
                        width: 18,
                        height: 18,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 2.5,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                      }, h('polyline', { points: '6 9 12 15 18 9' }))
                    )
                  ),
                  isOpen ? h('div', { className: 'cip-ch-lessons' },
                    ch.lessons.map(ls => {
                      const st = (store.lessons || {})[ls.id] || {};
                      const isDone = st.best != null;
                      return h('a', {
                        key: ls.id,
                        href: '#/lesson/' + ls.id,
                        className: 'cip-lesson-row',
                        onMouseEnter: () => App.prefetchLesson && App.prefetchLesson(ls.id, lang)
                      },
                        h('div', { className: 'cip-lesson-row-left' },
                          h('span', { style: { fontFamily: 'var(--f-mono)', color: '#2563eb' } }, ls.id),
                          h('span', null, lt(ls.title, lang))
                        ),
                        h('div', { className: 'cip-lesson-row-right' },
                          h('span', { className: 'cip-lesson-badge' }, `${ls.minutes} ${lang === 'ar' ? 'دقيقة' : 'min'}`),
                          h('span', {
                            style: {
                              fontWeight: 700,
                              color: isDone ? '#16a34a' : '#2563eb'
                            }
                          }, isDone ? (lang === 'ar' ? 'مكتمل ✓' : 'Done ✓') : (lang === 'ar' ? 'ابدأ الدرس ←' : 'Start Lesson →'))
                        )
                      );
                    })
                  ) : null
                );
              })
            )
          )
        ),

        /* Sticky Sidebar Column */
        h('aside', { className: 'cip-sidebar' },
          h('div', { className: 'cip-side-card' },
            h('img', {
              className: 'cip-side-img',
              src: course.image || './assets/img/lessons/alan_turing.jpg',
              alt: lt(course.title, lang)
            }),
            h('div', { className: 'cip-side-body' },
              h('div', { className: 'cip-price-block' },
                h('span', { className: 'cip-price-main' }, lang === 'ar' ? 'مجاني' : 'Free')
              ),
              h('a', {
                href: '#/lesson/' + firstLessonId,
                className: 'cip-cta-btn'
              },
                h('span', null, lang === 'ar' ? 'ابدأ التعلّم الآن' : 'Start Learning Now'),
                h('span', { 'aria-hidden': 'true' }, '←')
              ),
              h('ul', { className: 'cip-perks' },
                h('li', { className: 'cip-perk-item' },
                  h('span', { style: { color: '#16a34a', fontWeight: 800 } }, '✓'),
                  h('span', null, lang === 'ar' ? 'فيديوهات شرح لكل درس' : 'Video explanation for every lesson')
                ),
                h('li', { className: 'cip-perk-item' },
                  h('span', { style: { color: '#16a34a', fontWeight: 800 } }, '✓'),
                  h('span', null, lang === 'ar' ? 'ملازم الحصة والواجب لكل درس' : 'Class & homework handouts')
                ),
                h('li', { className: 'cip-perk-item' },
                  h('span', { style: { color: '#16a34a', fontWeight: 800 } }, '✓'),
                  h('span', null, lang === 'ar' ? 'واجب الكتروني + فيديو حل الواجب بالتفصيل' : 'Online homework + detailed video solutions')
                ),
                h('li', { className: 'cip-perk-item' },
                  h('span', { style: { color: '#16a34a', fontWeight: 800 } }, '✓'),
                  h('span', null, lang === 'ar' ? 'كويز الكتروني بوقت بعد كل حصة' : 'Timed online quiz after every class')
                )
              )
            )
          )
        )
      )
    );
  }

  /* ============ Hero Visual Stage (Starburst + 3D Icons + Students + Puffy Cloud) ============ */
  function HeroVisualStage({ lang }) {
    return h('div', { className: 'hero-visual', 'data-reveal': 'fade', 'data-delay': .2 },
      h('div', { className: 'hv-stage', dir: 'ltr' },
        /* 1. Ambient Blue Aura */
        h('div', { className: 'hv-aura', 'aria-hidden': 'true' }),

        /* 2. Blue Comic-Splash Starburst + Halftone Dots SVG */
        h('svg', {
          className: 'hv-burst-svg',
          viewBox: '0 0 800 620',
          fill: 'none',
          'aria-hidden': 'true'
        },
          /* Halftone dots left cluster */
          h('g', { fill: '#2376d8', opacity: '0.88' },
            h('circle', { cx: 92, cy: 268, r: 4.5 }),
            h('circle', { cx: 112, cy: 254, r: 5.5 }),
            h('circle', { cx: 134, cy: 242, r: 6.5 }),
            h('circle', { cx: 84, cy: 294, r: 5 }),
            h('circle', { cx: 106, cy: 282, r: 7 }),
            h('circle', { cx: 128, cy: 270, r: 8.5 }),
            h('circle', { cx: 78, cy: 322, r: 4.5 }),
            h('circle', { cx: 98, cy: 312, r: 6.5 }),
            h('circle', { cx: 120, cy: 300, r: 8 }),
            h('circle', { cx: 88, cy: 344, r: 5 }),
            h('circle', { cx: 110, cy: 334, r: 6.5 }),
            h('circle', { cx: 64, cy: 405, r: 4 }),
            h('circle', { cx: 82, cy: 416, r: 5.5 }),
            h('circle', { cx: 70, cy: 432, r: 4.5 })
          ),
          /* Halftone dots right cluster */
          h('g', { fill: '#2376d8', opacity: '0.88' },
            h('circle', { cx: 658, cy: 252, r: 6 }),
            h('circle', { cx: 680, cy: 266, r: 5 }),
            h('circle', { cx: 646, cy: 280, r: 7.5 }),
            h('circle', { cx: 670, cy: 294, r: 6 }),
            h('circle', { cx: 692, cy: 308, r: 4.5 }),
            h('circle', { cx: 656, cy: 316, r: 6.5 }),
            h('circle', { cx: 680, cy: 328, r: 5 }),
            h('circle', { cx: 215, cy: 196, r: 4.5 }),
            h('circle', { cx: 232, cy: 184, r: 3.5 })
          ),
          /* Dynamic Blue Starburst Splash Shape behind students */
          h('path', {
            d: 'M 155 152 Q 245 225 320 155 Q 395 215 495 140 Q 515 235 635 205 Q 575 295 695 362 Q 585 395 612 485 L 185 485 Q 205 405 92 365 Q 198 308 155 152 Z',
            fill: 'url(#hvBurstGrad)',
            stroke: '#3b8ef3',
            strokeWidth: '2.5',
            strokeLinejoin: 'round'
          }),
          h('defs', null,
            h('linearGradient', { id: 'hvBurstGrad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
              h('stop', { offset: '0%', stopColor: '#2b84ea' }),
              h('stop', { offset: '100%', stopColor: '#1b62be' })))
        ),

        /* 3. Floating 3D-Extruded Left Programming Icon (</>) */
        h('svg', {
          className: 'hv-icon-3d hv-icon-left',
          viewBox: '0 0 140 120',
          fill: 'none',
          'aria-hidden': 'true'
        },
          /* 3D Extrusion Depth Layer (#083d8c) */
          h('g', { transform: 'translate(5, 6)', fill: '#083d8c', stroke: '#083d8c', strokeWidth: '10', strokeLinecap: 'round', strokeLinejoin: 'round' },
            h('polyline', { points: '46,34 18,60 46,86' }),
            h('polyline', { points: '94,34 122,60 94,86' }),
            h('line', { x1: 78, y1: 24, x2: 62, y2: 96 })
          ),
          /* Bright Front Face (#1d82ff) */
          h('g', { fill: 'none', stroke: '#1d82ff', strokeWidth: '10', strokeLinecap: 'round', strokeLinejoin: 'round' },
            h('polyline', { points: '46,34 18,60 46,86' }),
            h('polyline', { points: '94,34 122,60 94,86' }),
            h('line', { x1: 78, y1: 24, x2: 62, y2: 96 })
          )
        ),

        /* 4. Floating 3D-Extruded Right Programming Icon ({x}) */
        h('svg', {
          className: 'hv-icon-3d hv-icon-right',
          viewBox: '0 0 150 130',
          fill: 'none',
          'aria-hidden': 'true'
        },
          /* 3D Extrusion Depth Layer (#083d8c) */
          h('g', { transform: 'translate(-5, 6)' },
            h('path', {
              d: 'M 22 68 L 36 62 L 50 96 L 76 24 L 132 16',
              stroke: '#083d8c',
              strokeWidth: '11',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }),
            h('path', {
              d: 'M 86 52 C 94 44, 102 48, 106 64 C 110 80, 118 84, 126 76 M 124 46 C 116 46, 108 58, 98 74 C 90 86, 84 84, 80 78',
              stroke: '#083d8c',
              strokeWidth: '10',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            })
          ),
          /* Bright Front Face (#1d82ff) */
          h('g', null,
            h('path', {
              d: 'M 22 68 L 36 62 L 50 96 L 76 24 L 132 16',
              stroke: '#1d82ff',
              strokeWidth: '11',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }),
            h('path', {
              d: 'M 86 52 C 94 44, 102 48, 106 64 C 110 80, 118 84, 126 76 M 124 46 C 116 46, 108 58, 98 74 C 90 86, 84 84, 80 78',
              stroke: '#1d82ff',
              strokeWidth: '10',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            })
          )
        ),

        /* 5. Real Students Cutout Photo */
        h('div', { className: 'hv-photo-wrap' },
          h('img', {
            src: './assets/img/hero_students.png',
            alt: lang === 'ar' ? 'طلاب يتعلمون البرمجة' : 'Students learning programming',
            className: 'hero-students-img',
            loading: 'eager'
          })
        ),

        /* 6. Puffy White Illustrated Cloud with Dark Navy Outline at Bottom Front */
        h('svg', {
          className: 'hv-cloud-svg',
          viewBox: '0 0 820 250',
          fill: 'none',
          'aria-hidden': 'true'
        },
          /* Outer Dark Shadow Drop */
          h('path', {
            d: 'M 92 128 C 42 122, 22 62, 74 36 C 112 16, 162 28, 180 64 C 204 42, 250 52, 256 92 C 282 82, 314 96, 322 126 C 344 102, 392 98, 418 126 C 446 98, 494 102, 514 128 C 524 96, 558 82, 584 94 C 592 52, 638 42, 662 66 C 680 28, 730 16, 768 38 C 818 66, 796 126, 746 132 C 776 164, 742 214, 692 204 C 674 238, 612 242, 586 208 C 560 236, 502 234, 482 198 C 452 238, 386 238, 356 198 C 336 234, 278 236, 252 208 C 226 242, 164 238, 146 204 C 96 214, 62 164, 92 128 Z',
            fill: '#08152c',
            transform: 'translate(0, 6)'
          }),
          /* Main White Cloud Body */
          h('path', {
            d: 'M 92 128 C 42 122, 22 62, 74 36 C 112 16, 162 28, 180 64 C 204 42, 250 52, 256 92 C 282 82, 314 96, 322 126 C 344 102, 392 98, 418 126 C 446 98, 494 102, 514 128 C 524 96, 558 82, 584 94 C 592 52, 638 42, 662 66 C 680 28, 730 16, 768 38 C 818 66, 796 126, 746 132 C 776 164, 742 214, 692 204 C 674 238, 612 242, 586 208 C 560 236, 502 234, 482 198 C 452 238, 386 238, 356 198 C 336 234, 278 236, 252 208 C 226 242, 164 238, 146 204 C 96 214, 62 164, 92 128 Z',
            fill: '#ffffff'
          }),
          /* Soft Blue-Gray Inner Shadow Crescent along the bottom puffs */
          h('path', {
            d: 'M 62 104 C 56 120, 72 132, 92 128 C 72 158, 98 198, 146 190 C 166 224, 224 226, 252 194 C 278 220, 334 220, 356 184 C 386 222, 452 222, 482 184 C 502 220, 560 220, 586 194 C 614 226, 672 224, 692 190 C 740 198, 766 158, 746 132 C 766 132, 782 120, 776 104 C 794 124, 774 140, 746 132 C 776 164, 742 214, 692 204 C 674 238, 612 242, 586 208 C 560 236, 502 234, 482 198 C 452 238, 386 238, 356 198 C 336 234, 278 236, 252 208 C 226 242, 164 238, 146 204 C 96 214, 62 164, 92 128 C 64 134, 48 120, 62 104 Z',
            fill: '#c3cde0'
          }),
          /* Crisp Dark Navy Cloud Outline + Interior Puff Curls */
          h('path', {
            d: 'M 92 128 C 42 122, 22 62, 74 36 C 112 16, 162 28, 180 64 C 204 42, 250 52, 256 92 C 282 82, 314 96, 322 126 C 344 102, 392 98, 418 126 C 446 98, 494 102, 514 128 C 524 96, 558 82, 584 94 C 592 52, 638 42, 662 66 C 680 28, 730 16, 768 38 C 818 66, 796 126, 746 132 C 776 164, 742 214, 692 204 C 674 238, 612 242, 586 208 C 560 236, 502 234, 482 198 C 452 238, 386 238, 356 198 C 336 234, 278 236, 252 208 C 226 242, 164 238, 146 204 C 96 214, 62 164, 92 128 Z',
            stroke: '#0a1936',
            strokeWidth: '5',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }),
          /* Interior Comic Puff Arcs (matching reference image) */
          h('path', {
            d: 'M 180 64 C 188 76, 186 92, 176 102 M 256 92 C 262 104, 258 118, 248 126 M 322 126 C 328 138, 322 150, 312 156 M 418 126 C 422 138, 418 150, 410 156 M 514 128 C 508 140, 512 152, 522 158 M 584 94 C 578 106, 582 120, 592 128 M 662 66 C 654 78, 656 94, 666 104 M 146 204 C 154 192, 166 186, 178 188 M 252 208 C 258 194, 270 186, 282 188 M 356 198 C 366 184, 384 182, 396 190 M 482 198 C 472 184, 454 182, 442 190 M 586 208 C 580 194, 568 186, 556 188 M 692 204 C 684 192, 672 186, 660 188',
            stroke: '#0a1936',
            strokeWidth: '4.5',
            strokeLinecap: 'round'
          })
        )
      )
    );
  }

  /* ============ home ============ */
  function Home({ meta, status, route }) {
    const { t, lang } = useLang();
    const store = useStore();
    useScan();
    const questions = status && status.questions ? status.questions[lang] : 171;

    useEffect(() => {
      if (!meta) return;
      const id = route.target;
      if (!id) return;
      const t0 = setTimeout(() => { scrollToEl(document.getElementById(id), 0); }, 60);
      return () => clearTimeout(t0);
    }, [route.target, meta]);

    return h('main', { id: 'main', className: 'home' },
      h('section', { className: 'hero' },
        h('div', { className: 'hero-main' },
          h('div', { className: 'hero-content' },
            h(Words, { tag: 'h1', className: 'hero-title', text: t.heroTitle, delay: .04 }),
            h('p', { className: 'hero-sub', 'data-reveal': '', 'data-delay': .08 }, t.heroSub),
            h('div', { className: 'hero-cta', 'data-reveal': '', 'data-delay': .12 },
              h('a', { className: 'solid big', href: '#/courses' }, t.heroCta, h('span', { className: 'arr', 'aria-hidden': 'true' }, '→')),
              h('span', { className: 'scroll-hint' }, h('span', { className: 'scroll-hint-box', 'aria-hidden': 'true' }, '↓'), t.scrollHint))),
          h(HeroVisualStage, { lang })),
        h('div', { className: 'hero-stats', 'data-reveal': 'fade', 'data-delay': .16 },
          [[COURSES_DATA.length, t.stats[0]], [meta ? meta.chapters.reduce((n, c) => n + c.lessons.length, 0) : 14, t.stats[1]], [questions ? questions + '+' : '171+', t.stats[2]]].map(([n, l], i) =>
            h('div', { key: i }, h('b', { dir: 'ltr' }, n), h('span', null, l))))),
      h(Marquee),
      h(CoursesCatalog, { meta, store, lang, t }));
  }

  /* ============ lesson page ============ */
  function KeyTerms({ items, arItems, bilingual }) {
    const { t } = useLang();
    const [open, setOpen] = useState({});
    return h('section', { className: 'terms' },
      h('div', { className: 'terms-head', 'data-reveal': '' },
        h('h2', null, t.keyTerms),
        h('p', null, t.keyTermsHint)),
      h('div', { className: 'terms-grid', 'data-stagger': '' },
        items.map((it, i) => {
          const arIt = bilingual && arItems && arItems[i];
          return h('button', { type: 'button', key: i, className: 'term' + (open[i] ? ' open' : ''), onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] },
            h('span', { className: 'term-t' },
              it.term,
              arIt ? h('span', { className: 'ar-row-sub', style: { fontWeight: 600, fontSize: '13px' }, dir: 'rtl' }, arIt.term) : null,
              h('i', { 'aria-hidden': 'true' })),
            h('span', { className: 'term-d' },
              h('span', null, it.def),
              arIt ? h('span', { className: 'ar-sub', dir: 'rtl' }, arIt.def) : null));
        })));
  }

  function Exercises({ items, arItems, bilingual }) {
    const { t } = useLang();
    const [open, setOpen] = useState({});
    return h('section', { className: 'practice sec' },
      h('div', { className: 'sec-head' },
        h('span', { className: 'sec-n' }, h(StarIcon)),
        h('div', null,
          h('h2', null, t.practice),
          h('p', { className: 'sec-sub' }, t.practiceSub))),
      h('div', { className: 'sec-body' },
        h('ol', { className: 'ex-list', 'data-stagger': '' }, items.map((ex, i) => {
          const arEx = bilingual && arItems && arItems[i];
          return h('li', { key: i, className: 'ex' + (open[i] ? ' open' : '') },
            h('div', { className: 'ex-q' },
              h('span', { className: 'ex-n' }, i + 1),
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' } },
                h('p', null, ex.prompt),
                arEx ? h('p', { className: 'ar-sub', dir: 'rtl' }, arEx.prompt) : null)),
            h('button', { type: 'button', className: 'ghost sm', onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] }, open[i] ? t.hideSol : t.showSol),
            h('div', { className: 'ex-sol' },
              h('div', null,
                h('p', null, ex.solution),
                arEx ? h('p', { className: 'ar-sub', style: { background: 'rgba(0,0,0,0.04)' }, dir: 'rtl' }, arEx.solution) : null)));
        }))));
  }

  /* ============ lesson video player section ============ */
  function LessonVideoSection({ id, title, lang }) {
    const currentUrl = App.StoreVideos.get(id) || '';
    /* lesson explicitly has no video -> render nothing */
    if (!currentUrl && App.StoreVideos.isRemoved(id)) return null;

    return h('section', { className: 'lesson-video-sec' },
      h(CustomVideoPlayer, {
        title: title || (lang === 'ar' ? 'فيديو الشرح' : 'Lesson Video'),
        src: currentUrl || '',
        duration: 152
      }),
      h('button', {
        type: 'button',
        className: 'video-to-explanation-indicator',
        onClick: () => {
          const el = document.querySelector('.terms') || document.getElementById('sec-0') || document.querySelector('.l-body');
          if (el) App.scrollToEl(el, 80);
        }
      },
        h('span', { className: 'vtei-text' }, lang === 'ar' ? 'الشرح' : 'Explanation'),
        h('svg', {
          className: 'vtei-arrow',
          width: 24,
          height: 24,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
          h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
          h('polyline', { points: '19 12 12 19 5 12' })
        )
      )
    );
  }

  function Lesson({ id, meta, status }) {
    const { t, lang } = useLang();
    const store = useStore();
    const [data, setData] = useState(null);
    const [arData, setArData] = useState(null);
    const [err, setErr] = useState(null);
    const [quizOpen, setQuizOpen] = useState(!!(Store.data.lessons || {})[id] && !!Store.data.lessons[id].read);
    const [readEnd, setReadEnd] = useState(true);
    const [bilingual, setBilingual] = useState(store.bilingual !== false);
    const end = useRef(null);
    const quizRef = useRef(null);
    const bar = useRef(null);

    const flat = useMemo(() => meta ? meta.chapters.flatMap(c => c.lessons.map(l => ({ ...l, chapter: c }))) : [], [meta]);
    const pos = flat.findIndex(l => l.id === id);
    const info = flat[pos];
    const nextLesson = pos >= 0 && pos < flat.length - 1 ? flat[pos + 1].id : null;
    const chapter = info ? info.chapter : null;
    const accent = chapter ? chapter.accent : '#2f5bff';

    const toggleBi = () => {
      const nv = !bilingual;
      Store.set({ bilingual: nv });
      setBilingual(nv);
    };

    useEffect(() => {
      setData(null); setArData(null); setErr(null); setReadEnd(true);
      setQuizOpen(!!((Store.data.lessons || {})[id] || {}).read);
      let live = true;
      if (lang === 'en') {
        Promise.all([getJSON(`/api/lesson/en/${id}`), getJSON(`/api/lesson/ar/${id}`).catch(() => null)])
          .then(([enD, arD]) => {
            if (live) { setData(enD); setArData(arD); }
          })
          .catch(e => live && setErr(e.status === 404 ? 'prep' : 'fail'));
      } else {
        getJSON(`/api/lesson/ar/${id}`)
          .then(d => { if (live) { setData(d); setArData(null); } })
          .catch(e => live && setErr(e.status === 404 ? 'prep' : 'fail'));
      }
      return () => { live = false; };
    }, [id, lang]);

    useScan();

    useEffect(() => {
      if (!data) return;
      // Record active study time every 15 seconds while the lesson tab is visible
      const studyIv = setInterval(() => {
        if (!document.hidden && Store.recordStudyTime) {
          Store.recordStudyTime(id, 15);
        }
      }, 15000);
      return () => clearInterval(studyIv);
    }, [data, id]);

    useEffect(() => {
      if (!data) return;
      const onScroll = () => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const prog = Math.min(1, Math.max(0, window.scrollY / max));
        if (bar.current) bar.current.style.transform = `scaleX(${prog})`;
        if (prog > 0.85) setReadEnd(true);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) setReadEnd(true); }, { threshold: 0 });
      if (end.current) io.observe(end.current);
      if (quizRef.current) io.observe(quizRef.current);
      return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
    }, [data]);

    const open = () => {
      Store.setLesson(id, { read: true });
      setQuizOpen(true);
      setTimeout(() => scrollToEl(quizRef.current, 90), 120);
    };
    const finished = (score, total, elapsedSeconds) => {
      const cur = ((Store.data.lessons || {})[id] || {});
      const prevBest = cur.best || 0;
      const prevAttempts = Number(cur.attempts) || 0;
      if (elapsedSeconds && Store.recordStudyTime) {
        Store.recordStudyTime(id, elapsedSeconds);
      }
      Store.setLesson(id, {
        read: true,
        completed: true,
        best: Math.max(prevBest, score),
        lastScore: score,
        total,
        attempts: prevAttempts + 1,
        lastStudiedAt: new Date().toISOString()
      });
    };

    if (err === 'prep') return h('main', { id: 'main', className: 'lesson-state', style: { '--accent': accent } }, h('h1', null, t.prepTitle), h('p', null, t.prepText), h('a', { className: 'solid', href: '#/course/students' }, t.backChapter));
    if (err) return h('main', { id: 'main', className: 'lesson-state' }, h('p', null, t.error), h('a', { className: 'solid', href: '#/course/students' }, t.backChapter));
    if (!data) return h('main', { id: 'main', className: 'lesson-state' }, h('p', { className: 'loading' }, t.loading));

    const isBi = lang === 'en' && bilingual && !!arData;
    const st = (store.lessons || {})[id] || {};

    return h('main', { id: 'main', className: 'lesson', style: { '--accent': accent } },
      h('div', { className: 'read-bar', ref: bar, 'aria-hidden': 'true' }),
      h('header', { className: 'l-hero' },
        h('div', { className: 'l-crumb-row' },
          h('a', { className: 'crumb', href: '#/chapter/' + (chapter ? chapter.id : 1) }, (lang === 'ar' ? '→ ' : '← '), chapter ? lt(chapter.title, lang) : ''),
          h('span', { className: 'l-ch-pill', dir: 'ltr' }, `${t.lesson} ${info ? info.id.replace('-', '.') : ''}`)
        ),
        h(Words, { tag: 'h1', className: 'l-title', text: data.title }),
        isBi && arData ? h('span', { className: 'ar-sub-title', dir: 'rtl' }, arData.title) : null,
        lang === 'en' ? h('div', { className: 'lesson-action-strip' },
          h('div', { className: 'bilingual-bar' },
            h('div', { className: 'bilingual-bar-text' },
              h('span', { className: 'bilingual-tag' }, 'EN + AR'),
              h('span', null, 'English curriculum with Arabic translation companion')),
            h('button', {
              type: 'button',
              className: 'bilingual-toggle-btn' + (bilingual ? ' on' : ''),
              onClick: toggleBi
            }, bilingual ? 'الترجمة العربية: مفعّلة' : 'تفعيل الترجمة العربية'))) : null,
        h('p', { className: 'l-hook', 'data-reveal': '', 'data-delay': .2 }, data.hook),
        isBi && arData ? h('p', { className: 'ar-sub', dir: 'rtl', style: { fontSize: '16.5px' } }, arData.hook) : null,
        h('div', { className: 'objectives-wrap' },
          h('p', { className: 'kicker objectives-kicker' }, t.objectives),
          h('ul', { className: 'objectives', 'data-stagger': '' }, data.objectives.map((o, i) => {
            const arO = isBi && arData && arData.objectives && arData.objectives[i];
            return h('li', { key: i },
              h('span', null, pad(i + 1)),
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                h('p', null, o),
                arO ? h('span', { className: 'ar-sub', dir: 'rtl' }, arO) : null));
          })))),
      h(LessonVideoSection, {
        id,
        title: data.title,
        watched: !!st.videoWatched,
        onMarkWatched: () => Store.setLesson(id, { videoWatched: true }),
        lang
      }),
      h(KeyTerms, { items: data.keyTerms, arItems: arData && arData.keyTerms, bilingual: isBi }),
      h('div', { className: 'l-body' }, data.sections.map((s, i) => {
        const arS = isBi && arData && arData.sections && arData.sections[i];
        return h('section', { key: s.id || i, className: 'sec', id: 'sec-' + i },
          h('div', { className: 'sec-head' },
            h('span', { className: 'sec-n' }, pad(i + 1)),
            h('div', null,
              h('h2', null, s.title),
              arS && arS.title ? h('span', { className: 'ar-sub-title', dir: 'rtl' }, arS.title) : null)),
          h('div', { className: 'sec-body' }, s.blocks.map((b, k) => h(App.Block, { key: k, b, arB: arS && arS.blocks && arS.blocks[k], bilingual: isBi }))));
      })),
      h('section', { className: 'recap' },
        h('div', { className: 'recap-in', 'data-reveal': 'scale' },
          h('h2', null, t.recap),
          h('ul', null, data.recap.map((r, i) => {
            const arR = isBi && arData && arData.recap && arData.recap[i];
            return h('li', { key: i },
              h('span', null, r),
              arR ? h('span', { className: 'ar-sub', dir: 'rtl' }, arR) : null);
          })))),
      h(Exercises, { items: data.exercises, arItems: arData && arData.exercises, bilingual: isBi }),
      h('div', { ref: end, className: 'end-sentinel' }),
      h('section', { className: 'finish', ref: quizRef },
        !quizOpen
          ? h('div', { className: 'finish-box', 'data-reveal': '' },
            h('h2', null, t.finishTitle), h('p', null, t.finishText),
            h('button', { type: 'button', className: 'solid big', disabled: !readEnd, onClick: open }, t.finishBtn),
            !readEnd ? h('p', { className: 'lock-hint' }, t.readFirst) : null)
          : h('div', { className: 'quiz-box' },
            h('div', { className: 'quiz-head' }, h('p', { className: 'kicker' }, t.quiz), h('h2', null, data.title)),
            h(App.Quiz, { lesson: data, arLesson: arData, bilingual: isBi, accent, nextLesson, best: st.best, onDone: finished }))));
  }

  /* ============ Spotlight Search Modal (Ctrl + K) ============ */
  function SpotlightSearch({ open, onClose, lang }) {
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    const results = useMemo(() => App.search(query, lang), [query, lang]);

    useEffect(() => {
      if (open) {
        setQuery('');
        setActiveIdx(0);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
      }
    }, [open]);

    useEffect(() => {
      setActiveIdx(0);
    }, [results]);

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => (i + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => (i - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[activeIdx]) {
          navigate(results[activeIdx]);
        }
      }
    };

    const navigate = item => {
      onClose();
      const target = item.target || (item.type === 'course' ? '#/course/' + item.id : item.type === 'lesson' ? '#/lesson/' + item.id : '#/chapter/' + item.ch);
      if (location.hash === target) {
        if (item.type === 'demo' || item.type === 'figure' || item.type === 'term') {
          const el = document.querySelector('.demo') || document.querySelector('.b-figures') || document.querySelector('.terms');
          if (el) App.scrollToEl(el, 80);
        }
      } else {
        location.hash = target;
      }
    };

    if (!open) return null;

    const badgeLabel = type => {
      if (type === 'course') return lang === 'en' ? 'Course' : 'كورس';
      if (type === 'lesson') return lang === 'en' ? 'Lesson' : 'درس';
      if (type === 'demo') return lang === 'en' ? 'Simulator' : 'محاكي';
      if (type === 'figure') return lang === 'en' ? 'Pioneer / Device' : 'شخصية / جهاز';
      return lang === 'en' ? 'Key Term' : 'مصطلح أساسي';
    };

    return h('div', { className: 'spotlight-modal', onClick: onClose, onKeyDown: handleKeyDown },
      h('div', { className: 'spotlight-box', onClick: e => e.stopPropagation() },
        h('div', { className: 'spotlight-bar' },
          h('span', { className: 'spotlight-icon' }, h(SearchIcon)),
          h('input', {
            ref: inputRef,
            className: 'spotlight-input',
            value: query,
            onChange: e => setQuery(e.target.value),
            placeholder: lang === 'en' ? 'Search courses, lessons, key terms... (Ctrl+K)' : 'ابحث في الكورسات والدروس والمصطلحات... (Ctrl+K)'
          }),
          h('span', { className: 'spotlight-esc' }, 'ESC')),
        h('div', { className: 'spotlight-list' },
          results.length > 0
            ? results.map((it, idx) => h('div', {
              key: idx,
              className: 'spotlight-item' + (idx === activeIdx ? ' is-active' : ''),
              onClick: () => navigate(it),
              onMouseEnter: () => setActiveIdx(idx)
            },
              h('div', { className: 'spotlight-item-main' },
                h('span', { className: 'spotlight-item-title' }, lang === 'en' ? it.title : (it.titleAr || it.title)),
                h('span', { className: 'spotlight-item-sub', dir: lang === 'en' ? 'rtl' : 'ltr' }, lang === 'en' ? it.titleAr : it.title)),
              h('span', { className: 'spotlight-badge badge-' + it.type }, badgeLabel(it.type))))
            : query.trim()
              ? h('div', { className: 'spotlight-empty' }, lang === 'en' ? 'No matching results found.' : 'لم يتم العثور على نتائج مطابقة.')
              : h('div', { className: 'spotlight-empty' }, lang === 'en' ? 'Type to search courses, lessons, and terms...' : 'اكتب للبحث في جميع الكورسات والدروس والمصطلحات...')),
        /* spotlight-footer removed */));
  }

  /* ============ Floating TTS Audio Player Bar ============ */
  function TTSPlayerBar() {
    const [tts, setTts] = useState({ speaking: false, paused: false, text: '', rate: 1.0 });

    useEffect(() => {
      const fn = s => setTts({ ...s });
      App.TTS.subs.add(fn);
      return () => App.TTS.subs.delete(fn);
    }, []);

    if (!tts.speaking && !tts.paused) return null;

    const togglePlay = () => {
      if (tts.paused) App.TTS.resume();
      else App.TTS.pause();
    };

    const nextRate = () => {
      const rates = [0.8, 1.0, 1.25];
      const next = rates[(rates.indexOf(tts.rate) + 1) % rates.length] || 1.0;
      App.TTS.setRate(next);
    };

    return h('div', { className: 'tts-player', role: 'region', 'aria-label': 'Audio Reader' },
      h('div', { className: 'tts-player-icon' }, h(VolumeIcon)),
      h('div', { className: 'tts-player-text' }, tts.text),
      h('div', { className: 'tts-player-controls' },
        h('button', { type: 'button', className: 'tts-ctrl-btn', onClick: togglePlay, title: tts.paused ? 'استئناف القراءة' : 'إيقاف مؤقت' }, tts.paused ? h(PlayIcon) : h(PauseIcon)),
        h('button', { type: 'button', className: 'tts-ctrl-btn', onClick: () => App.TTS.stop(), title: 'إيقاف القراءة' }, h(StopIcon)),
        h('button', { type: 'button', className: 'tts-speed-btn', onClick: nextRate, title: 'سرعة القراءة' }, tts.rate + 'x'),
        h('button', { type: 'button', className: 'tts-close-btn', onClick: () => App.TTS.stop(), title: 'إغلاق المشغّل' }, '×')));
  }

  /* ZenToolbar removed */

  /* ============ visual site texts editor modal ============ */
  const TEXT_CATEGORIES = [
    {
      id: 'auth',
      nameAr: 'بوابة الدخول والتسجيل',
      nameEn: 'Auth & Registration',
      keys: [
        { key: 'authHeading', labelAr: 'عنوان الصفحة الرئيسي', labelEn: 'Main Heading' },
        { key: 'authSub', labelAr: 'الوصف والرسالة الترحيبية', labelEn: 'Welcome Subtitle', isLong: true },
        { key: 'registerTab', labelAr: 'تبويب إنشاء حساب', labelEn: 'Register Tab' },
        { key: 'loginTab', labelAr: 'تبويب تسجيل الدخول', labelEn: 'Login Tab' },
        { key: 'fullName', labelAr: 'تسمية حقل الاسم', labelEn: 'Full Name Label' },
        { key: 'fullNamePh', labelAr: 'المثال داخل حقل الاسم', labelEn: 'Full Name Placeholder' },
        { key: 'username', labelAr: 'تسمية حقل اسم المستخدم', labelEn: 'Username Label' },
        { key: 'usernamePh', labelAr: 'المثال داخل حقل اسم المستخدم', labelEn: 'Username Placeholder' },
        { key: 'gmail', labelAr: 'تسمية حقل البريد الإلكتروني', labelEn: 'Gmail Label' },
        { key: 'phone', labelAr: 'تسمية حقل الهاتف', labelEn: 'Phone Label' },
        { key: 'password', labelAr: 'تسمية حقل كلمة المرور', labelEn: 'Password Label' },
        { key: 'passwordPh', labelAr: 'تنبيه شروط كلمة المرور', labelEn: 'Password Hint' },
        { key: 'confirmPassword', labelAr: 'تسمية تأكيد كلمة المرور', labelEn: 'Confirm Password Label' },
        { key: 'selectCountry', labelAr: 'تسمية اختيار الدولة', labelEn: 'Select Country Label' },
        { key: 'streamHeading', labelAr: 'سؤال اختيار لغة الدراسة', labelEn: 'Language Preference Heading' },
        { key: 'streamAr', labelAr: 'رمز اللغة العربية (AR)', labelEn: 'AR Label' },
        { key: 'streamEn', labelAr: 'رمز اللغة الإنجليزية (EN)', labelEn: 'EN Label' },
        { key: 'btnRegister', labelAr: 'زر إنشاء الحساب', labelEn: 'Create Account Button' },
        { key: 'btnLogin', labelAr: 'زر تسجيل الدخول', labelEn: 'Sign In Button' },
        { key: 'haveAccount', labelAr: 'سؤال لديك حساب بالفعل؟', labelEn: 'Have Account Text' },
        { key: 'noAccount', labelAr: 'سؤال ليس لديك حساب؟', labelEn: 'No Account Text' },
        { key: 'goToLogin', labelAr: 'زر الانتقال لتسجيل الدخول', labelEn: 'Go To Login Text' },
        { key: 'goToRegister', labelAr: 'زر الانتقال للتسجيل الجديد', labelEn: 'Go To Register Text' },
        { key: 'regSuccess', labelAr: 'رسالة نجاح إنشاء الحساب', labelEn: 'Registration Success Notice', isLong: true }
      ]
    },
    {
      id: 'brand',
      nameAr: 'العناوين والهيدر والفوتر',
      nameEn: 'Brand, Header & Footer',
      keys: [
        { key: 'siteTitle', labelAr: 'عنوان الموقع في المتصفح (Tab Title)', labelEn: 'Browser Tab Title' },
        { key: 'brand', labelAr: 'اسم المنصة', labelEn: 'Platform Brand Name' },
        { key: 'copyrightOwner', labelAr: 'اسم مالك حقوق النشر', labelEn: 'Copyright Owner' },
        { key: 'coursesNav', labelAr: 'اسم رابط الكورسات في الهيدر', labelEn: 'Courses Navbar Label' },
        { key: 'heroTitle', labelAr: 'العنوان الرئيسي في الصفحة الرئيسية', labelEn: 'Hero Main Title' },
        { key: 'heroSub', labelAr: 'الوصف الرئيسي للمنصة', labelEn: 'Hero Description', isLong: true },
        { key: 'heroCta', labelAr: 'زر استكشاف الكورسات الرئيسي', labelEn: 'Hero CTA Button' },
        { key: 'manifesto', labelAr: 'فقرة رسالة المنصة وطريقة التعلم', labelEn: 'Platform Manifesto', isLong: true },
        { key: 'coursesKicker', labelAr: 'شارة قسم الكورسات', labelEn: 'Courses Section Kicker' },
        { key: 'coursesTitle', labelAr: 'عنوان قسم الكورسات', labelEn: 'Courses Section Title' },
        { key: 'footerRights', labelAr: 'حقوق النشر في الفوتر', labelEn: 'Footer Rights Note' }
      ]
    },
    {
      id: 'guest',
      nameAr: 'وضع الزائر (Guest Mode)',
      nameEn: 'Guest Mode',
      keys: [
        { key: 'guestSignIn', labelAr: 'نص زر المتابعة كزائر', labelEn: 'Guest Button Label' },
        { key: 'guestSubtitle', labelAr: 'الوصف تحت زر الزائر', labelEn: 'Guest Button Subtitle', isLong: true },
        { key: 'guestBadge', labelAr: 'شارة وضع الزائر', labelEn: 'Guest Badge' },
        { key: 'guestNoSavePill', labelAr: 'شارة مؤقت / غير محفوظ', labelEn: 'No-save Pill Tag' },
        { key: 'guestTempWarning', labelAr: 'تنبيه عدم حفظ التقدم للزائر', labelEn: 'Guest Unsaves Notice', isLong: true },
        { key: 'createAccountToSave', labelAr: 'زر إنشاء حساب لحفظ التقدم', labelEn: 'Save Progress Button' },
        { key: 'exitGuest', labelAr: 'زر الخروج من وضع الزائر', labelEn: 'Exit Guest Mode Button' },
        { key: 'orDivider', labelAr: 'كلمة الفاصل بين الدخول والزائر', labelEn: 'OR Divider Label' }
      ]
    },
    {
      id: 'lesson',
      nameAr: 'الدروس ومحاضرات الفيديو',
      nameEn: 'Lessons & Video Lecture',
      keys: [
        { key: 'lessonVideo', labelAr: 'عنوان قسم فيديو الشرح', labelEn: 'Lesson Video Heading' },
        { key: 'lessonVideoSub', labelAr: 'وصف قسم الفيديو التفاعلي', labelEn: 'Lesson Video Subtitle', isLong: true },
        { key: 'markVideoDone', labelAr: 'زر إنهاء الفيديو والانتقال للشرح', labelEn: 'Finish Video Button' },
        { key: 'videoWatched', labelAr: 'شارة تمت مشاهدة المحاضرة', labelEn: 'Video Completed Badge' },
        { key: 'continueToText', labelAr: 'زر التمرير إلى محتوى الدرس', labelEn: 'Scroll to Content Button' },
        { key: 'objectives', labelAr: 'عنوان أهداف الدرس', labelEn: 'Objectives Heading' },
        { key: 'keyTerms', labelAr: 'عنوان مصطلحات الدرس', labelEn: 'Key Terms Heading' },
        { key: 'recap', labelAr: 'عنوان خلاصة الدرس', labelEn: 'Recap Heading' },
        { key: 'practice', labelAr: 'عنوان تمارين الحل والتطبيق', labelEn: 'Practice Heading' },
        { key: 'showSol', labelAr: 'زر إظهار الحل', labelEn: 'Show Solution Button' },
        { key: 'hideSol', labelAr: 'زر إخفاء الحل', labelEn: 'Hide Solution Button' }
      ]
    },
    {
      id: 'quiz',
      nameAr: 'الاختبارات والتفاعل والتركيز',
      nameEn: 'Quizzes & Focus Mode',
      keys: [
        { key: 'finishTitle', labelAr: 'عنوان اكتمال القراءة', labelEn: 'Finished Reading Heading' },
        { key: 'finishBtn', labelAr: 'زر بدء الاختبار', labelEn: 'Start Quiz Button' },
        { key: 'quiz', labelAr: 'عنوان صندوق الاختبار', labelEn: 'Quiz Box Title' },
        { key: 'check', labelAr: 'زر التحقق من الإجابة', labelEn: 'Check Answer Button' },
        { key: 'next', labelAr: 'زر السؤال التالي', labelEn: 'Next Question Button' },
        { key: 'seeResult', labelAr: 'زر عرض النتيجة', labelEn: 'See Results Button' },
        { key: 'retry', labelAr: 'زر إعادة الاختبار', labelEn: 'Retry Quiz Button' },
        { key: 'score', labelAr: 'تسمية النتيجة والدرجة', labelEn: 'Score Label' },
        { key: 'msgHigh', labelAr: 'رسالة التهنئة بالدرجة العالية', labelEn: 'High Score Message' },
        { key: 'zenMode', labelAr: 'تسمية وضع التركيز', labelEn: 'Zen Mode Label' },
        { key: 'zenEsc', labelAr: 'تلميح الخروج من التركيز', labelEn: 'Zen Exit Hint' }
      ]
    }
  ];

  /* SiteTextEditor removed */

  /* ============ root ============ */
  function parseRoute() {
    const rawHash = location.hash.replace(/^#/, '') || '/';
    const [hash, queryStr] = rawHash.split('?');
    let m;
    if (hash === '/dashboard' || hash === '/profile' || hash === '/progress') {
      return {
        name: 'dashboard',
        editProfile: Boolean(queryStr && queryStr.includes('edit=1')),
        key: 'dashboard'
      };
    }
    if ((m = hash.match(/^\/lesson\/(\d-\d)$/))) return { name: 'lesson', id: m[1], key: hash, chapter: +m[1][0] };
    if ((m = hash.match(/^\/course\/([a-z0-9_-]+)$/i))) return { name: 'course', courseId: m[1].toLowerCase(), key: 'course-' + m[1].toLowerCase() };
    if ((m = hash.match(/^\/chapter\/(\d)$/))) return { name: 'course', courseId: 'students', targetChapter: +m[1], key: 'course-students', chapter: +m[1] };
    if (hash === '/courses' || hash === '/chapters') return { name: 'home', target: 'courses', key: 'home' };
    return { name: 'home', key: 'home' };
  }

  function Root() {
    const store = useStore();
    const authUser = App.useAuth();
    const currentLang = store.lang || (authUser && authUser.stream) || 'ar';
    const [searchOpen, setSearchOpen] = useState(false);
    const [route, setRoute] = useState(parseRoute());
    const [meta, setMeta] = useState(() => App.initialMeta || null);
    const [status, setStatus] = useState(() => App.initialStatus || null);
    const [textVersion, setTextVersion] = useState(0);

    const ctx = useMemo(() => ({ lang: currentLang, t: STR[currentLang], dir: currentLang === 'ar' ? 'rtl' : 'ltr' }), [currentLang, textVersion]);

    useEffect(() => { App.initSmoothScroll(); }, []);
    useEffect(() => {
      return App.subscribeTexts(() => setTextVersion(v => v + 1));
    }, []);
    useEffect(() => {
      const f = () => setRoute(parseRoute());
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    }, []);
    useEffect(() => {
      if (!meta) getJSON('/api/meta').then(setMeta).catch(() => { });
      if (!status) getJSON('/api/status').then(setStatus).catch(() => { });
    }, []);
    useEffect(() => {
      if (!authUser) return;
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      const curT = STR[currentLang];
      document.title = (curT && (curT.siteTitle || curT.brand)) || 'Syntax';
    }, [currentLang, textVersion, authUser]);

    // Shortcuts: Ctrl+K for search
    useEffect(() => {
      const onKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setSearchOpen(prev => !prev);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
      if (!authUser) return;
      App.TTS.stop();
      if (route.name === 'lesson' || route.name === 'dashboard' || (route.name === 'course' && !route.targetChapter) || (route.name === 'home' && !route.target)) {
        window.scrollTo(0, 0);
      }
      return () => killAll();
    }, [route.key, currentLang, authUser]);

    if (!authUser) {
      return h(AuthPortal, {
        onAuthSuccess: (u) => {
          Store.loadUser(u.username);
          Store.set({ lang: u.stream || 'ar' });
        }
      });
    }

    const setLangDirectly = (newLang) => Store.set({ lang: newLang });

    return h(LangCtx.Provider, { value: ctx },
      h(BrutalScrollProgress),
      h('a', { className: 'skip', href: '#main' }, ctx.lang === 'ar' ? 'تخطَّ إلى المحتوى الرئيسي' : 'Skip to content'),
      h(Header, {
        meta,
        onSetLang: setLangDirectly,
        route,
        onOpenSearch: () => setSearchOpen(true),
        authUser,
        onLogout: () => App.Auth.logout()
      }),
      route.name === 'dashboard'
        ? h(StudentProgressDashboard, { key: 'dashboard-' + currentLang, meta, user: authUser, route })
        : route.name === 'lesson'
          ? h(Lesson, { key: route.id + currentLang, id: route.id, meta, status })
          : route.name === 'course'
            ? h(CourseView, { key: route.key + currentLang, courseId: route.courseId, targetChapter: route.targetChapter, meta, status })
            : h(Home, { key: 'home' + currentLang, meta, status, route }),
      h(Footer, { onOpenSearch: () => setSearchOpen(true) }),
      h(SpotlightSearch, { open: searchOpen, onClose: () => setSearchOpen(false), lang: currentLang }),
      h(TTSPlayerBar)
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
})();
