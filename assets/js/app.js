/* app.js — routing, pages, animations, and bilingual English+Arabic support */
(function () {
  const { h, STR, Store, useStore, LangCtx, useLang, getJSON, scrollToEl, scrollToY, getLenis, scan, killAll, useScan, Words, ScrubWords } = App;
  const { useState, useEffect, useRef, useMemo } = React;
  const pad = n => String(n).padStart(2, '0');
  const lt = (obj, lang) => obj[lang] || obj.en;

  /* ============ SVG Icons ============ */
  const SearchIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
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

  const ZenIcon = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('circle', { cx: 12, cy: 12, r: 3 }),
    h('path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }),
    h('path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }),
    h('path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }),
    h('path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }));

  const CloseIcon = () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
    h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }));

  /* ============ hero ambient micro-field ============ */
  function Particles() {
    const ref = useRef(null);
    useEffect(() => {
      const cv = ref.current;
      const ctx = cv.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, hgt = 0, P = [], raf = 0, visible = true;
      const mouse = { x: -9999, y: -9999 };
      const resize = () => {
        w = cv.clientWidth; hgt = cv.clientHeight;
        cv.width = w * dpr; cv.height = hgt * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.min(180, Math.round(w * hgt / 8000));
        P = Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * hgt,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 0.9 + Math.random() * 1.4,
          baseAlpha: 0.12 + Math.random() * 0.2,
          ox: 0, oy: 0
        }));
      };
      const onMove = e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
      const onLeave = () => { mouse.x = mouse.y = -9999; };
      const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw); }, { threshold: 0 });
      function draw() {
        raf = 0;
        if (!visible) return;
        const isDark = document.documentElement.dataset.theme === 'dark';
        const pColor = isDark ? '240, 246, 252' : '47, 91, 255';
        ctx.clearRect(0, 0, w, hgt);
        for (const p of P) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = hgt; else if (p.y > hgt) p.y = 0;

          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          let tx = 0, ty = 0;
          if (d < 140) {
            const f = (1 - d / 140);
            tx = (dx / (d || 1)) * f * 35;
            ty = (dy / (d || 1)) * f * 35;
          }
          p.ox += (tx - p.ox) * 0.08;
          p.oy += (ty - p.oy) * 0.08;

          ctx.beginPath();
          ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pColor}, ${p.baseAlpha})`;
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      }
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerleave', onLeave);
      io.observe(cv);
      raf = requestAnimationFrame(draw);
      return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove); };
    }, []);
    return h('canvas', { ref, className: 'particles', 'aria-hidden': 'true' });
  }

  /* ============ language gate ============ */
  function Gate({ onPick }) {
    const root = useRef(null);
    useEffect(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.gate-k', { y: 20, opacity: 0, duration: .8 })
        .from('.gate-t .wi', { yPercent: 110, duration: 1, stagger: .08 }, '-=.5')
        .from('.gate-opt', { y: 60, opacity: 0, duration: 1, stagger: .15 }, '-=.6');
    }, []);
    const pick = lang => {
      gsap.to(root.current, { opacity: 0, duration: .5, ease: 'power2.inOut', onComplete: () => onPick(lang) });
    };
    const Opt = ({ lang, title, sub, tag }) => h('button', { className: 'gate-opt', onClick: () => pick(lang), lang },
      h('span', { className: 'gate-tag' }, tag),
      h('span', { className: 'gate-big', dir: lang === 'ar' ? 'rtl' : 'ltr' }, title),
      h('span', { className: 'gate-sub', dir: lang === 'ar' ? 'rtl' : 'ltr' }, sub),
      h('span', { className: 'gate-arrow', 'aria-hidden': 'true' }, '→'));
    return h('div', { className: 'gate', ref: root, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Choose your stream' },
      h('div', { className: 'gate-inner' },
        h('p', { className: 'gate-k' }, 'Before we start · قبل أن نبدأ'),
        h('h1', { className: 'gate-t' },
          h('span', { className: 'w' }, h('span', { className: 'wi' }, 'Are you Arabic')), ' ',
          h('span', { className: 'w' }, h('span', { className: 'wi' }, 'or Languages?'))),
        h('p', { className: 'gate-ar', dir: 'rtl' }, 'هل أنت في القسم العربي أم قسم اللغات؟'),
        h('div', { className: 'gate-opts' },
          h(Opt, { lang: 'ar', title: 'عربي', sub: 'المنهج كاملًا بالعربية', tag: 'AR' }),
          h(Opt, { lang: 'en', title: 'Languages', sub: 'Curriculum in English + ترجمة عربي', tag: 'EN' })),
        h('p', { className: 'gate-foot' }, '© ' + new Date().getFullYear() + ' Maged Aboraya')));
  }

  /* ============ header / footer ============ */
  function Header({ meta, onSwitch, route, onOpenSearch, theme, onToggleTheme, zen, onToggleZen }) {
    const { t, lang } = useLang();
    const store = useStore();
    const [scrolled, setScrolled] = useState(false);
    const total = meta ? meta.chapters.reduce((n, c) => n + c.lessons.length, 0) : 0;
    const done = Object.values(store.lessons || {}).filter(l => l.best != null).length;
    useEffect(() => {
      const f = () => setScrolled(window.scrollY > 24);
      f(); window.addEventListener('scroll', f, { passive: true });
      return () => window.removeEventListener('scroll', f);
    }, []);
    return h('header', { className: 'hdr' + (scrolled ? ' scrolled' : '') },
      h('a', { className: 'brand', href: '#/' },
        h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
        h('span', { className: 'brand-t' }, t.brand)),
      h('nav', { className: 'nav', 'aria-label': 'Chapters' },
        (meta ? meta.chapters : []).map(c => h('a', { key: c.id, href: '#/chapter/' + c.id, className: 'nav-i' + (route.chapter === c.id ? ' on' : ''), style: { '--a': c.accent }, title: lt(c.title, lang) },
          h('span', { className: 'nav-n' }, pad(c.id)), h('span', { className: 'nav-t' }, lt(c.title, lang))))),
      h('div', { className: 'hdr-r' },
        h('button', {
          className: 'hdr-btn',
          onClick: onOpenSearch,
          title: lang === 'en' ? 'Search curriculum (Ctrl+K)' : 'البحث في المنهج (Ctrl+K)'
        },
          h(SearchIcon),
          h('span', null, lang === 'en' ? 'Search' : 'بحث'),
          h('span', { className: 'spotlight-esc' }, 'Ctrl+K')),
        route.name === 'lesson' ? h('button', {
          className: 'hdr-btn icon-only zen-hdr-btn' + (zen ? ' is-active' : ''),
          onClick: onToggleZen,
          title: t.zenModeHint
        }, h(ZenIcon)) : null,
        h('button', {
          className: 'hdr-btn icon-only',
          onClick: onToggleTheme,
          title: theme === 'dark' ? 'الوضع النهاري / Light Mode' : 'الوضع الليلي / Dark Mode'
        }, theme === 'dark' ? h(SunIcon) : h(MoonIcon)),
        total ? h('span', { className: 'hdr-prog', title: t.progress }, h('b', { dir: 'ltr' }, done + '/' + total)) : null,
        h('button', { className: 'lang-btn', onClick: onSwitch }, t.switchTo)));
  }

  function Footer() {
    const { t } = useLang();
    return h('footer', { className: 'ftr' },
      h('div', { className: 'ftr-in' },
        h('div', { className: 'ftr-big', 'aria-hidden': 'true' }, 'Maged Aboraya'),
        h('div', { className: 'ftr-row' },
          t.footerNote ? h('p', null, t.footerNote) : null,
          h('p', { className: 'copy' }, '© ', new Date().getFullYear(), ' Maged Aboraya. ', t.footerRights, '.'))));
  }

  /* ============ marquee ============ */
  const TERMS = ['Artificial Intelligence', 'Machine Learning', 'Encryption', 'Firewall', 'HTTP', 'HTML', 'CSS', 'JavaScript', 'User Experience', 'Moore’s Law', 'Authentication', 'Responsive Design'];
  function Marquee() {
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
    const row = TERMS.concat(TERMS);
    return h('div', { className: 'marquee', 'aria-hidden': 'true', dir: 'ltr' },
      h('div', { className: 'mq-track', ref: track }, row.concat(row).map((s, i) => h('span', { key: i }, s, h('i')))));
  }

  /* ============ home ============ */
  const CH_PREVIEWS = {
    1: [
      { img: './assets/img/lessons/gordon_moore.png', name: 'Gordon Moore' },
      { img: './assets/img/lessons/eniac.jpg', name: 'ENIAC (1945)' },
      { img: './assets/img/lessons/intel_4004.jpg', name: 'Intel 4004' },
      { img: './assets/img/lessons/alan_turing.jpg', name: 'Alan Turing' },
      { img: './assets/img/lessons/self_driving.jpg', name: 'Waymo Car' }
    ],
    2: [
      { img: './assets/img/lessons/julius_caesar.jpg', name: 'Julius Caesar' },
      { img: './assets/img/lessons/enigma.jpg', name: 'Enigma' },
      { img: './assets/img/lessons/firewall.png', name: 'Firewall' },
      { img: './assets/img/lessons/yubikey.jpg', name: 'YubiKey 2FA' },
      { img: './assets/img/lessons/soc.jpg', name: 'Cyber SOC' }
    ],
    3: [
      { img: './assets/img/lessons/tim_berners_lee.jpg', name: 'Tim Berners-Lee' },
      { img: './assets/img/lessons/next_computer.jpg', name: 'First Web Server' },
      { img: './assets/img/lessons/submarine_cable.png', name: 'Submarine Cable' },
      { img: './assets/img/lessons/brendan_eich.jpg', name: 'Brendan Eich' },
      { img: './assets/img/lessons/hakon_lie.jpg', name: 'Håkon Wium Lie' }
    ],
    4: [
      { img: './assets/img/lessons/rgb_pixels.jpg', name: 'RGB Pixels' },
      { img: './assets/img/lessons/don_norman.jpg', name: 'Don Norman' },
      { img: './assets/img/lessons/wireframe.png', name: 'Wireframe' },
      { img: './assets/img/lessons/braille_display.jpg', name: 'Braille Display' },
      { img: './assets/img/lessons/jakob_nielsen.jpg', name: 'Jakob Nielsen' }
    ]
  };

  function ChapterPanel({ c, idx, status, lang, t, store }) {
    const lessons = c.lessons;
    const doneN = lessons.filter(l => (store.lessons || {})[l.id] && store.lessons[l.id].best != null).length;
    const ready = id => !status || (status[lang] || []).includes(id);
    const isEn = lang === 'en';

    return h('section', { className: 'panel', id: 'chapter-' + c.id, style: { '--accent': c.accent }, 'data-idx': idx },
      h('div', { className: 'panel-in' },
        h('div', { className: 'panel-num', 'aria-hidden': 'true' }, pad(c.id)),
        h('div', { className: 'panel-main' },
          h('p', { className: 'kicker' }, `${t.chapter} ${pad(c.id)} · ${lessons.length} ${t.lessons}`),
          h(Words, { tag: 'h2', className: 'panel-title', text: lt(c.title, lang) }),
          isEn ? h('span', { className: 'ar-sub-title', dir: 'rtl' }, c.title.ar) : null,
          h('p', { className: 'panel-blurb', 'data-reveal': '' }, lt(c.blurb, lang)),
          isEn ? h('p', { className: 'ar-sub', dir: 'rtl', style: { margin: '8px 0 16px' } }, c.blurb.ar) : null,
          h('div', { className: 'panel-prog', 'data-reveal': '' }, h('i', null, h('b', { style: { width: (doneN / lessons.length * 100) + '%' } })), h('span', { dir: 'ltr' }, `${doneN} / ${lessons.length}`)),
          h('div', { className: 'panel-gallery-strip', 'data-reveal': '' },
            h('span', { className: 'pgs-label' }, isEn ? 'Pioneers & Real Hardware in this chapter:' : 'شخصيات وأجهزة حقيقية في هذا الفصل:'),
            h('div', { className: 'pgs-items' },
              (CH_PREVIEWS[c.id] || []).map((p, k) => h('div', { key: k, className: 'pgs-item', title: p.name },
                h('img', { src: p.img, alt: p.name, loading: 'lazy' }),
                h('span', null, p.name)))))),
        h('ol', { className: 'lesson-list', 'data-stagger': '' },
          lessons.map((l, i) => {
            const st = (store.lessons || {})[l.id] || {};
            const isDone = st.best != null;
            const ok = ready(l.id);
            return h('li', { key: l.id },
              h('a', { className: 'lrow' + (ok ? '' : ' off'), href: ok ? '#/lesson/' + l.id : undefined, 'aria-disabled': !ok },
                h('span', { className: 'lrow-n' }, `${c.id}.${i + 1}`),
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 } },
                  h('span', { className: 'lrow-t' }, lt(l.title, lang)),
                  isEn ? h('span', { className: 'ar-row-sub', dir: 'rtl' }, l.title.ar) : null),
                h('span', { className: 'lrow-m' }, `${l.minutes} ${t.min}`),
                h('span', { className: 'lrow-s' + (isDone ? ' done' : '') }, !ok ? t.notReady : isDone ? `${st.best}/${st.total}` : (st.read ? t.cont : t.start)),
                h('span', { className: 'lrow-a', 'aria-hidden': 'true' }, '→')));
          })),
        null));
  }

  function Home({ meta, status, route }) {
    const { t, lang } = useLang();
    const store = useStore();
    useScan();
    const questions = status && status.questions ? status.questions[lang] : 0;
    useEffect(() => {
      if (App.reduced) return;
      const ctxs = [];
      ctxs.push(gsap.to('.hero-content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
      const panels = gsap.utils.toArray('.panel');
      panels.forEach((p, i) => {
        if (i === panels.length - 1) return;
        ctxs.push(gsap.to(p.querySelector('.panel-in'), { scale: .93, opacity: .35, ease: 'none', scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: true } }));
        ctxs.push(gsap.to(p.querySelector('.panel-num'), { yPercent: 20, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } }));
      });
      return () => ctxs.forEach(c => { if (c.scrollTrigger) c.scrollTrigger.kill(); c.kill(); });
    }, [meta]);
    useEffect(() => {
      if (!meta) return;
      const id = route.target;
      if (!id) return;
      const t0 = setTimeout(() => { scrollToEl(document.getElementById(id), id === 'chapters' ? 0 : 0); }, 120);
      return () => clearTimeout(t0);
    }, [route.target, meta]);

    return h('main', { id: 'main', className: 'home' },
      h('section', { className: 'hero' },
        h(Particles),
        h('div', { className: 'hero-content' },
          h('p', { className: 'kicker', 'data-reveal': 'fade' }, t.heroKicker + ' · ' + t.grade),
          h('h1', { className: 'hero-title', 'data-words': '', 'data-delay': .15 },
            t.heroTitle.map((w, i) => h('span', { className: 'w', key: i }, h('span', { className: 'wi' }, w), ' '))),
          h('p', { className: 'hero-sub', 'data-reveal': '', 'data-delay': .5 }, t.heroSub),
          h('div', { className: 'hero-stream-selector', 'data-reveal': '', 'data-delay': .6 },
            h('button', {
              className: 'stream-pill' + (lang === 'ar' ? ' active' : ''),
              onClick: () => Store.set({ lang: 'ar' })
            }, 'عربي · المنهج كاملًا بالعربية'),
            h('button', {
              className: 'stream-pill' + (lang === 'en' ? ' active' : ''),
              onClick: () => Store.set({ lang: 'en' })
            }, 'Languages · English + ترجمة عربي مرافقة')),
          h('div', { className: 'hero-cta', 'data-reveal': '', 'data-delay': .7 },
            h('a', { className: 'solid big', href: '#/chapter/1' }, t.heroCta, h('span', { className: 'arr', 'aria-hidden': 'true' }, '→')),
            h('span', { className: 'scroll-hint' }, h('i'), t.scrollHint))),
        h('div', { className: 'hero-stats', 'data-reveal': 'fade', 'data-delay': .9 },
          [[meta ? meta.chapters.length : 4, t.stats[0]], [meta ? meta.chapters.reduce((n, c) => n + c.lessons.length, 0) : 14, t.stats[1]], [questions ? questions + '+' : '—', t.stats[2]]].map(([n, l], i) =>
            h('div', { key: i }, h('b', { dir: 'ltr' }, n), h('span', null, l))))),
      h('section', { className: 'manifesto' }, h(ScrubWords, { text: t.manifesto })),
      h(Marquee),
      h('section', { className: 'chapters', id: 'chapters' },
        h('div', { className: 'chapters-head' },
          h('p', { className: 'kicker', 'data-reveal': '' }, t.chaptersKicker),
          h(Words, { tag: 'h2', className: 'section-title', text: t.chaptersTitle })),
        meta ? meta.chapters.map((c, i) => h(ChapterPanel, { key: c.id, c, idx: i, status, lang, t, store })) : h('p', { className: 'loading' }, t.loading)));
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
          return h('button', { key: i, className: 'term' + (open[i] ? ' open' : ''), onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] },
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
    return h('section', { className: 'practice' },
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
            h('button', { className: 'ghost sm', onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] }, open[i] ? t.hideSol : t.showSol),
            h('div', { className: 'ex-sol' },
              h('div', null,
                h('p', null, ex.solution),
                arEx ? h('p', { className: 'ar-sub', style: { background: 'rgba(0,0,0,0.04)' }, dir: 'rtl' }, arEx.solution) : null)));
        }))));
  }

  function Lesson({ id, meta, status, zen, onToggleZen }) {
    const { t, lang } = useLang();
    const store = useStore();
    const [data, setData] = useState(null);
    const [arData, setArData] = useState(null);
    const [err, setErr] = useState(null);
    const [quizOpen, setQuizOpen] = useState(!!(Store.data.lessons || {})[id] && !!Store.data.lessons[id].read);
    const [readEnd, setReadEnd] = useState(false);
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
      setData(null); setArData(null); setErr(null); setReadEnd(false);
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
      const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`; } });
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) setReadEnd(true); }, { threshold: 0 });
      if (end.current) io.observe(end.current);
      return () => { st.kill(); io.disconnect(); };
    }, [data]);

    const open = () => {
      Store.setLesson(id, { read: true });
      setQuizOpen(true);
      setTimeout(() => scrollToEl(quizRef.current, 90), 120);
    };
    const finished = (score, total) => {
      const prev = ((Store.data.lessons || {})[id] || {}).best || 0;
      Store.setLesson(id, { read: true, best: Math.max(prev, score), total });
    };

    if (err === 'prep') return h('main', { id: 'main', className: 'lesson-state', style: { '--accent': accent } }, h('h1', null, t.prepTitle), h('p', null, t.prepText), h('a', { className: 'solid', href: '#/chapters' }, t.backChapter));
    if (err) return h('main', { id: 'main', className: 'lesson-state' }, h('p', null, t.error), h('a', { className: 'solid', href: '#/chapters' }, t.backChapter));
    if (!data) return h('main', { id: 'main', className: 'lesson-state' }, h('p', { className: 'loading' }, t.loading));

    const isBi = lang === 'en' && bilingual && !!arData;
    const st = (store.lessons || {})[id] || {};

    return h('main', { id: 'main', className: 'lesson', style: { '--accent': accent } },
      h('div', { className: 'read-bar', ref: bar, 'aria-hidden': 'true' }),
      h('header', { className: 'l-hero' },
        h('div', { className: 'l-num', 'aria-hidden': 'true', 'data-parallax': 40 }, chapter ? pad(chapter.id) : ''),
        h('a', { className: 'crumb', href: '#/chapter/' + (chapter ? chapter.id : 1) }, (lang === 'ar' ? '→ ' : '← '), chapter ? lt(chapter.title, lang) : ''),
        h('p', { className: 'kicker' }, `${t.lesson} ${info ? info.id.replace('-', '.') : ''}`),
        h(Words, { tag: 'h1', className: 'l-title', text: data.title }),
        isBi && arData ? h('span', { className: 'ar-sub-title', dir: 'rtl' }, arData.title) : null,
        h('div', { className: 'lesson-action-strip' },
          lang === 'en' ? h('div', { className: 'bilingual-bar' },
            h('div', { className: 'bilingual-bar-text' },
              h('span', { className: 'bilingual-tag' }, 'Bilingual · ثنائي اللغة'),
              h('span', null, 'English curriculum with Arabic translation companion')),
            h('button', {
              className: 'bilingual-toggle-btn' + (bilingual ? ' on' : ''),
              onClick: toggleBi
            }, bilingual ? 'الترجمة العربية: مفعّلة' : 'تفعيل الترجمة العربية')) : null,
          h('button', {
            className: 'zen-trigger-btn' + (zen ? ' is-active' : ''),
            onClick: onToggleZen,
            title: t.zenModeHint
          },
            h(ZenIcon),
            h('span', null, zen ? t.zenExit : t.zenMode),
            h('span', { className: 'zen-trigger-kbd' }, 'Z'))),
        h('p', { className: 'l-hook', 'data-reveal': '', 'data-delay': .3 }, data.hook),
        isBi && arData ? h('p', { className: 'ar-sub', dir: 'rtl', style: { fontSize: '16.5px' } }, arData.hook) : null,
        h('ul', { className: 'objectives', 'data-stagger': '' }, data.objectives.map((o, i) => {
          const arO = isBi && arData && arData.objectives && arData.objectives[i];
          return h('li', { key: i },
            h('span', null, pad(i + 1)),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              h('p', null, o),
              arO ? h('span', { className: 'ar-sub', dir: 'rtl' }, arO) : null));
        }))),
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
              h('button', { className: 'solid big', disabled: !readEnd, onClick: open }, t.finishBtn),
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
      const target = item.target || (item.type === 'lesson' ? '#/lesson/' + item.id : '#/chapter/' + item.ch);
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
      if (type === 'lesson') return lang === 'en' ? 'Lesson' : 'درس';
      if (type === 'demo') return lang === 'en' ? 'Interactive Lab' : 'مختبر تفاعلي';
      if (type === 'figure') return lang === 'en' ? 'Pioneer / Device' : 'شخصية / عتاد';
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
            placeholder: lang === 'en' ? 'Search lessons, key terms, pioneers, labs... (Ctrl+K)' : 'ابحث في الدروس والمصطلحات والشخصيات والمختبرات... (Ctrl+K)'
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
                  h('span', { className: 'spotlight-item-sub', dir: 'rtl' }, lang === 'en' ? it.titleAr : it.title)),
                h('span', { className: 'spotlight-badge badge-' + it.type }, badgeLabel(it.type))))
            : query.trim()
                ? h('div', { className: 'spotlight-empty' }, lang === 'en' ? 'No matching results found.' : 'لم يتم العثور على نتائج مطابقة.')
                : h('div', { className: 'spotlight-empty' }, lang === 'en' ? 'Type to search the entire curriculum...' : 'اكتب للبحث في جميع فصول ومصطلحات المنهج...')),
        h('div', { className: 'spotlight-footer' },
          h('span', null, lang === 'en' ? '↑↓ navigate · ↵ open · ESC close' : '↑↓ للتنقل · ↵ للفتح · ESC للإغلاق'))));
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
        h('button', { className: 'tts-ctrl-btn', onClick: togglePlay, title: tts.paused ? 'استئناف' : 'إيقاف مؤقت' }, tts.paused ? h(PlayIcon) : h(PauseIcon)),
        h('button', { className: 'tts-ctrl-btn', onClick: () => App.TTS.stop(), title: 'إيقاف تام' }, h(StopIcon)),
        h('button', { className: 'tts-speed-btn', onClick: nextRate, title: 'سرعة القراءة' }, tts.rate + 'x'),
        h('button', { className: 'tts-close-btn', onClick: () => App.TTS.stop(), title: 'إغلاق المشغل' }, '×')));
  }

  /* ============ Floating Zen Focus Toolbar ============ */
  function ZenToolbar({ onExit, onToggleTheme, theme, fontSize, setFontSize, t }) {
    return h('div', { className: 'zen-bar', role: 'toolbar', 'aria-label': 'Focus Mode Bar' },
      h('div', { className: 'zen-bar-badge' },
        h('span', { className: 'zen-dot', 'aria-hidden': 'true' }),
        h('span', null, t.zenMode)),
      h('div', { className: 'zen-bar-tools' },
        h('button', {
          className: 'zen-tool-btn' + (fontSize === 'big' ? ' on' : ''),
          onClick: () => setFontSize(fontSize === 'big' ? 'normal' : 'big'),
          title: fontSize === 'big' ? t.zenFontNormal : t.zenFontBig
        },
          h('span', { className: 'zen-tool-txt' }, fontSize === 'big' ? 'A+' : 'A')),
        h('button', {
          className: 'zen-tool-btn',
          onClick: onToggleTheme,
          title: theme === 'dark' ? 'الوضع النهاري / Light Mode' : 'الوضع الليلي / Dark Mode'
        }, theme === 'dark' ? h(SunIcon) : h(MoonIcon)),
        h('button', {
          className: 'zen-exit-pill',
          onClick: onExit,
          title: t.zenEsc
        },
          h(CloseIcon),
          h('span', null, t.zenExit),
          h('span', { className: 'zen-esc-kbd' }, 'ESC'))));
  }

  /* ============ root ============ */
  function parseRoute() {
    const hash = location.hash.replace(/^#/, '') || '/';
    let m;
    if ((m = hash.match(/^\/lesson\/(\d-\d)$/))) return { name: 'lesson', id: m[1], key: hash, chapter: +m[1][0] };
    if ((m = hash.match(/^\/chapter\/(\d)$/))) return { name: 'home', target: 'chapter-' + m[1], key: 'home', chapter: +m[1] };
    if (hash === '/chapters') return { name: 'home', target: 'chapters', key: 'home' };
    return { name: 'home', key: 'home' };
  }

  function Root() {
    const store = useStore();
    const lang = store.lang || null;
    const theme = store.theme || 'light';
    const [zen, setZen] = useState(false);
    const [zenFont, setZenFont] = useState('normal');
    const [searchOpen, setSearchOpen] = useState(false);
    const [route, setRoute] = useState(parseRoute());
    const [meta, setMeta] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => { App.initSmoothScroll(); }, []);
    useEffect(() => {
      const f = () => setRoute(parseRoute());
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    }, []);
    useEffect(() => { getJSON('/api/meta').then(setMeta).catch(() => {}); getJSON('/api/status').then(setStatus).catch(() => {}); }, []);
    useEffect(() => {
      if (!lang) return;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.title = 'Maged Aboraya';
    }, [lang]);
    useEffect(() => {
      document.documentElement.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
      document.documentElement.dataset.zen = zen ? 'true' : 'false';
      document.documentElement.dataset.zenFont = zenFont;
    }, [zen, zenFont]);

    // Exit Zen if navigating away from lesson
    useEffect(() => {
      if (route.name !== 'lesson') setZen(false);
    }, [route.name]);

    // Shortcuts: Z to toggle Zen, Escape to exit Zen, Ctrl+K for search
    useEffect(() => {
      const onKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setSearchOpen(prev => !prev);
          return;
        }
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.key === 'Escape' && zen) {
          e.preventDefault();
          setZen(false);
        } else if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (route.name === 'lesson') {
            e.preventDefault();
            setZen(prev => !prev);
          }
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [zen, route.name]);

    useEffect(() => {
      if (!lang) return;
      App.TTS.stop();
      if (route.name === 'lesson' || !route.target) {
        const l = getLenis();
        if (l) l.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
      }
      const el = document.getElementById('main');
      if (el && !App.reduced) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .6, ease: 'power2.out', clearProps: 'opacity' });
      return () => killAll();
    }, [route.key, lang]);

    const ctx = useMemo(() => ({ lang: lang || 'en', t: STR[lang || 'en'], dir: lang === 'ar' ? 'rtl' : 'ltr' }), [lang]);
    const switchLang = () => Store.set({ lang: lang === 'ar' ? 'en' : 'ar' });
    const toggleTheme = () => Store.set({ theme: theme === 'dark' ? 'light' : 'dark' });
    const toggleZen = () => setZen(prev => !prev);

    if (!lang) return h(Gate, { onPick: l => Store.set({ lang: l }) });
    return h(LangCtx.Provider, { value: ctx },
      h('a', { className: 'skip', href: '#main' }, ctx.lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'),
      h(Header, {
        meta,
        onSwitch: switchLang,
        route,
        onOpenSearch: () => setSearchOpen(true),
        theme,
        onToggleTheme: toggleTheme,
        zen,
        onToggleZen: toggleZen
      }),
      zen && route.name === 'lesson'
        ? h(ZenToolbar, {
            onExit: () => setZen(false),
            onToggleTheme: toggleTheme,
            theme,
            fontSize: zenFont,
            setFontSize: setZenFont,
            t: ctx.t
          })
        : null,
      route.name === 'lesson'
        ? h(Lesson, { key: route.id + lang, id: route.id, meta, status, zen, onToggleZen: toggleZen })
        : h(Home, { key: 'home' + lang, meta, status, route }),
      h(Footer),
      h(SpotlightSearch, { open: searchOpen, onClose: () => setSearchOpen(false), lang }),
      h(TTSPlayerBar));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
})();
