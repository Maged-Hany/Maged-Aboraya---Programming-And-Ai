/* app.js — routing, pages, and bilingual English + Arabic support */
(function () {
  const { h, STR, Store, useStore, LangCtx, useLang, getJSON, scrollToEl, killAll, useScan } = App;
  const { useState, useEffect, useRef, useMemo } = React;
  const lt = (obj, lang) => (obj && (obj[lang] || obj.en)) || '';
  const YEAR = new Date().getFullYear();

  /* ============ text size (shared by lesson toolbar and focus mode) ============ */
  const FS = ['s', 'm', 'l', 'xl'];
  const stepFont = d => {
    const cur = FS.indexOf(Store.data.fontSize || 'm');
    const i = Math.max(0, Math.min(FS.length - 1, (cur < 0 ? 1 : cur) + d));
    Store.set({ fontSize: FS[i] });
  };

  /* ============ SVG icons ============ */
  const svg = (size, kids, extra) => h('svg', Object.assign({
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false'
  }, extra || {}), ...kids);
  const SearchIcon = ({ size }) => svg(size || 16, [h('circle', { key: 1, cx: 11, cy: 11, r: 7 }), h('line', { key: 2, x1: 20, y1: 20, x2: 16.2, y2: 16.2 })]);
  const SunIcon = () => svg(17, [
    h('circle', { key: 0, cx: 12, cy: 12, r: 4.5 }),
    ...[[12, 1.5, 12, 3.5], [12, 20.5, 12, 22.5], [4.2, 4.2, 5.6, 5.6], [18.4, 18.4, 19.8, 19.8], [1.5, 12, 3.5, 12], [20.5, 12, 22.5, 12], [4.2, 19.8, 5.6, 18.4], [18.4, 5.6, 19.8, 4.2]]
      .map((l, i) => h('line', { key: i + 1, x1: l[0], y1: l[1], x2: l[2], y2: l[3] }))]);
  const MoonIcon = () => svg(16, [h('path', { key: 1, d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' })]);
  const PlayIcon = () => svg(12, [h('polygon', { key: 1, points: '6 4 20 12 6 20 6 4' })], { fill: 'currentColor', stroke: 'none' });
  const PauseIcon = () => svg(12, [h('rect', { key: 1, x: 6, y: 4, width: 4, height: 16 }), h('rect', { key: 2, x: 14, y: 4, width: 4, height: 16 })], { fill: 'currentColor', stroke: 'none' });
  const StopIcon = () => svg(11, [h('rect', { key: 1, x: 5, y: 5, width: 14, height: 14, rx: 2 })], { fill: 'currentColor', stroke: 'none' });
  const VolumeIcon = () => svg(16, [h('polygon', { key: 1, points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }), h('path', { key: 2, d: 'M15.5 8.5a5 5 0 0 1 0 7' })]);
  const FocusIcon = () => svg(16, [h('circle', { key: 1, cx: 12, cy: 12, r: 3 }), h('path', { key: 2, d: 'M3 8V5a2 2 0 0 1 2-2h3' }), h('path', { key: 3, d: 'M16 3h3a2 2 0 0 1 2 2v3' }), h('path', { key: 4, d: 'M21 16v3a2 2 0 0 1-2 2h-3' }), h('path', { key: 5, d: 'M8 21H5a2 2 0 0 1-2-2v-3' })]);
  const CloseIcon = ({ size }) => svg(size || 14, [h('line', { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }), h('line', { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 })]);
  const ChevronIcon = ({ size }) => svg(size || 16, [h('path', { key: 1, d: 'M9 6l6 6-6 6' })], { className: 'flip-rtl' });
  const BackIcon = ({ size }) => svg(size || 16, [h('path', { key: 1, d: 'M15 6l-6 6 6 6' })], { className: 'flip-rtl' });
  const CheckIcon = ({ size }) => svg(size || 14, [h('polyline', { key: 1, points: '20 6 9 17 4 12' })], { strokeWidth: 2.6 });
  const ClockIcon = ({ size }) => svg(size || 14, [h('circle', { key: 1, cx: 12, cy: 12, r: 9 }), h('polyline', { key: 2, points: '12 7 12 12 15.5 14' })]);
  const BrandMark = () => h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, 'MA');

  /* ============ helpers ============ */
  const flatLessons = meta => meta ? meta.chapters.flatMap(c => c.lessons.map(l => ({ ...l, chapter: c }))) : [];
  const isDone = (store, id) => { const s = (store.lessons || {})[id]; return !!(s && s.best != null); };
  function pickNext(flat, store) {
    if (!flat.length) return null;
    const lastIdx = flat.findIndex(l => l.id === store.last);
    if (lastIdx >= 0 && !isDone(store, flat[lastIdx].id)) return { lesson: flat[lastIdx], kind: 'continue' };
    const after = lastIdx >= 0 ? flat.slice(lastIdx + 1).find(l => !isDone(store, l.id)) : null;
    const open = after || flat.find(l => !isDone(store, l.id));
    if (open) return { lesson: open, kind: Object.keys(store.lessons || {}).length ? 'continue' : 'start' };
    return { lesson: flat[0], kind: 'done' };
  }

  /* ============ language gate ============ */
  function Gate({ onPick }) {
    const Opt = ({ lang, title, sub, tag }) => h('button', { className: 'gate-opt', onClick: () => onPick(lang), lang, dir: lang === 'ar' ? 'rtl' : 'ltr' },
      h('span', { className: 'gate-tag' }, tag),
      h('span', { className: 'gate-big' }, title),
      h('span', { className: 'gate-sub' }, sub),
      h('span', { className: 'gate-go' }, h(ChevronIcon, { size: 20 })));
    return h('div', { className: 'gate', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gate-title' },
      h('div', { className: 'gate-inner' },
        h('div', { className: 'gate-brand' }, h(BrandMark), h('span', null, 'Maged Aboraya')),
        h('h1', { id: 'gate-title', className: 'gate-t' }, 'Which stream are you in?'),
        h('p', { className: 'gate-ar', dir: 'rtl' }, 'أنت في أي قسم؟'),
        h('div', { className: 'gate-opts' },
          h(Opt, { lang: 'ar', title: 'القسم العربي', sub: 'المنهج كاملًا باللغة العربية', tag: 'عربي' }),
          h(Opt, { lang: 'en', title: 'Languages', sub: 'English curriculum with Arabic translation', tag: 'English + عربي' })),
        h('p', { className: 'gate-foot' }, 'You can switch any time from the top bar', h('br'), h('span', { dir: 'rtl' }, 'يمكنك التغيير في أي وقت من الشريط العلوي'))));
  }

  /* ============ header / footer ============ */
  function Header({ meta, route, onOpenSearch, theme, onToggleTheme, onSwitch, zen, onToggleZen }) {
    const { t, lang } = useLang();
    const store = useStore();
    const flat = flatLessons(meta);
    const done = flat.filter(l => isDone(store, l.id)).length;
    return h('header', { className: 'hdr' },
      h('div', { className: 'hdr-in' },
        h('a', { className: 'brand', href: '#/' }, h(BrandMark), h('span', { className: 'brand-t' }, 'Maged Aboraya')),
        h('nav', { className: 'hdr-nav', 'aria-label': t.allChapters },
          (meta ? meta.chapters : []).map(c => h('a', {
            key: c.id, href: '#/chapter/' + c.id, title: lt(c.title, lang),
            className: 'hdr-ch' + (route.chapter === c.id ? ' on' : ''), style: { '--a': c.accent }
          }, h('b', null, c.id), h('span', null, lt(c.title, lang))))),
        h('div', { className: 'hdr-r' },
          h('button', { className: 'hdr-search', onClick: onOpenSearch, 'aria-label': t.search },
            h(SearchIcon), h('span', { className: 'hdr-search-t' }, t.search), h('kbd', null, 'Ctrl K')),
          route.name === 'lesson' ? h('button', { className: 'icon-btn' + (zen ? ' on' : ''), onClick: onToggleZen, title: t.zenModeHint, 'aria-label': t.zenMode, 'aria-pressed': zen }, h(FocusIcon)) : null,
          h('button', { className: 'icon-btn', onClick: onToggleTheme, title: theme === 'dark' ? t.lightMode : t.darkMode, 'aria-label': theme === 'dark' ? t.lightMode : t.darkMode }, theme === 'dark' ? h(SunIcon) : h(MoonIcon)),
          flat.length ? h('span', { className: 'hdr-prog', title: t.progress }, h('b', { dir: 'ltr' }, done + '/' + flat.length)) : null,
          h('button', { className: 'lang-btn', onClick: onSwitch, title: lang === 'ar' ? 'Languages (English + عربي)' : 'القسم العربي' }, lang === 'ar' ? 'English' : 'عربي'))));
  }

  function Footer() {
    const { t } = useLang();
    return h('footer', { className: 'ftr' },
      h('div', { className: 'wrap ftr-in' },
        h('a', { className: 'brand', href: '#/' }, h(BrandMark), h('span', { className: 'brand-t' }, 'Maged Aboraya')),
        h('p', null, t.siteTitle + ' · ' + t.grade),
        h('p', { className: 'copy' }, '© ' + YEAR + ' Maged Aboraya. ' + t.footerRights + '.')));
  }

  /* ============ home ============ */
  const CH_PREVIEWS = {
    1: [
      { img: './assets/img/lessons/eniac.jpg', name: 'ENIAC' },
      { img: './assets/img/lessons/gordon_moore.png', name: 'Gordon Moore' },
      { img: './assets/img/lessons/alan_turing.jpg', name: 'Alan Turing' },
      { img: './assets/img/lessons/self_driving.jpg', name: 'Waymo' }
    ],
    2: [
      { img: './assets/img/lessons/julius_caesar.jpg', name: 'Julius Caesar' },
      { img: './assets/img/lessons/enigma.jpg', name: 'Enigma' },
      { img: './assets/img/lessons/yubikey.jpg', name: 'YubiKey' },
      { img: './assets/img/lessons/firewall.png', name: 'Firewall' }
    ],
    3: [
      { img: './assets/img/lessons/tim_berners_lee.jpg', name: 'Tim Berners-Lee' },
      { img: './assets/img/lessons/next_computer.jpg', name: 'NeXT' },
      { img: './assets/img/lessons/brendan_eich.jpg', name: 'Brendan Eich' },
      { img: './assets/img/lessons/submarine_cable.png', name: 'Submarine cable' }
    ],
    4: [
      { img: './assets/img/lessons/rgb_pixels.jpg', name: 'RGB pixels' },
      { img: './assets/img/lessons/don_norman.jpg', name: 'Don Norman' },
      { img: './assets/img/lessons/jakob_nielsen.jpg', name: 'Jakob Nielsen' },
      { img: './assets/img/lessons/braille_display.jpg', name: 'Braille display' }
    ]
  };

  function ProgressCard({ next, done, total, avg }) {
    const { t, lang } = useLang();
    const pct = total ? Math.round(done / total * 100) : 0;
    const l = next ? next.lesson : null;
    return h('aside', { className: 'progress-card', style: l ? { '--accent': l.chapter.accent } : null },
      h('div', { className: 'pc-top' },
        h('span', { className: 'pc-label' }, t.yourProgress),
        h('span', { className: 'pc-pct', dir: 'ltr' }, pct + '%')),
      h('div', { className: 'bar' }, h('i', { style: { width: pct + '%' } })),
      h('div', { className: 'pc-stats' },
        h('div', null, h('b', { dir: 'ltr' }, done + ' / ' + total), h('span', null, t.lessonsDone)),
        h('div', null, h('b', { dir: 'ltr' }, avg == null ? '—' : avg + '%'), h('span', null, t.avgScore))),
      l ? h('a', { className: 'pc-next', href: '#/lesson/' + l.id },
        h('span', { className: 'pc-next-k' }, next.kind === 'start' ? t.startFirst : next.kind === 'done' ? t.allDone : t.continueLesson),
        h('span', { className: 'pc-next-t' }, h('span', { className: 'pc-next-n', dir: 'ltr' }, l.id.replace('-', '.')), lt(l.title, lang)),
        h('span', { className: 'pc-next-go' }, h(ChevronIcon, { size: 20 }))) : null);
  }

  function ChapterCard({ c, store, ready }) {
    const { t, lang } = useLang();
    const isEn = lang === 'en';
    const ls = store.lessons || {};
    const doneN = c.lessons.filter(l => isDone(store, l.id)).length;
    const people = CH_PREVIEWS[c.id] || [];
    return h('section', { className: 'ch-card', id: 'chapter-' + c.id, style: { '--accent': c.accent } },
      h('header', { className: 'ch-head' },
        h('div', { className: 'ch-meta' },
          h('span', { className: 'ch-num' }, t.chapter + ' ' + c.id),
          h('span', { className: 'ch-count', dir: 'ltr' }, doneN + '/' + c.lessons.length)),
        h('h3', { className: 'ch-title' }, lt(c.title, lang)),
        isEn ? h('p', { className: 'ch-title-ar', dir: 'rtl' }, c.title.ar) : null,
        h('p', { className: 'ch-blurb' }, lt(c.blurb, lang)),
        h('div', { className: 'bar sm' }, h('i', { style: { width: (doneN / c.lessons.length * 100) + '%' } }))),
      h('ol', { className: 'ch-lessons' }, c.lessons.map((l, i) => {
        const st = ls[l.id] || {};
        const fin = st.best != null;
        const ok = ready(l.id);
        return h('li', { key: l.id },
          h('a', { className: 'ch-lesson' + (ok ? '' : ' off') + (fin ? ' done' : ''), href: ok ? '#/lesson/' + l.id : undefined, 'aria-disabled': ok ? undefined : 'true' },
            h('span', { className: 'cl-n', dir: 'ltr' }, fin ? h(CheckIcon, { size: 14 }) : c.id + '.' + (i + 1)),
            h('span', { className: 'cl-main' },
              h('span', { className: 'cl-t' }, lt(l.title, lang)),
              isEn ? h('span', { className: 'cl-ar', dir: 'rtl' }, l.title.ar) : null),
            h('span', { className: 'cl-side' },
              !ok ? h('span', { className: 'cl-min' }, t.notReady)
                : fin ? h('span', { className: 'cl-score', dir: 'ltr' }, st.best + '/' + st.total)
                : st.read ? h('span', { className: 'cl-prog' }, t.cont)
                : h('span', { className: 'cl-min' }, l.minutes + ' ' + t.min)),
            h('span', { className: 'cl-go' }, h(ChevronIcon, { size: 16 }))));
      })),
      people.length ? h('div', { className: 'ch-people' },
        h('span', { className: 'ch-people-l' }, t.inChapter),
        h('div', { className: 'ch-people-row' }, people.map((p, k) => h('span', { key: k, className: 'person', title: p.name },
          h('img', { src: p.img, alt: '', loading: 'lazy', width: 26, height: 26 }),
          h('span', null, p.name))))) : null);
  }

  function Home({ meta, status, route }) {
    const { t, lang } = useLang();
    const store = useStore();
    const isEn = lang === 'en';
    const flat = useMemo(() => flatLessons(meta), [meta]);
    const ls = store.lessons || {};
    const ready = id => !status || (status[lang] || []).includes(id);
    const doneList = flat.filter(l => isDone(store, l.id));
    const scored = doneList.filter(l => ls[l.id].total);
    const avg = scored.length ? Math.round(scored.reduce((n, l) => n + ls[l.id].best / ls[l.id].total, 0) / scored.length * 100) : null;
    const next = pickNext(flat, store);
    const questions = status && status.questions ? status.questions[lang] : 0;

    useEffect(() => {
      if (!meta || !route.target) return;
      const id = setTimeout(() => scrollToEl(document.getElementById(route.target)), 40);
      return () => clearTimeout(id);
    }, [route.target, route.stamp, meta]);

    return h('main', { id: 'main', className: 'home' },
      h('section', { className: 'home-top' },
        h('div', { className: 'wrap home-top-in' },
          h('div', { className: 'intro' },
            h('p', { className: 'eyebrow' }, t.grade),
            h('h1', { className: 'intro-title' }, t.siteTitle),
            isEn ? h('p', { className: 'intro-ar', dir: 'rtl' }, 'البرمجة والذكاء الاصطناعي') : null,
            h('p', { className: 'intro-sub' }, t.siteSub),
            h('div', { className: 'intro-facts' },
              h('span', null, h('b', { dir: 'ltr' }, meta ? meta.chapters.length : 4), ' ', t.stats[0]),
              h('span', null, h('b', { dir: 'ltr' }, flat.length || 14), ' ', t.stats[1]),
              questions ? h('span', null, h('b', { dir: 'ltr' }, questions + '+'), ' ', t.stats[2]) : null),
            h('div', { className: 'stream-switch', role: 'group', 'aria-label': t.stream },
              h('button', { className: lang === 'ar' ? 'on' : '', 'aria-pressed': lang === 'ar', onClick: () => Store.set({ lang: 'ar' }) }, 'القسم العربي'),
              h('button', { className: lang === 'en' ? 'on' : '', 'aria-pressed': lang === 'en', onClick: () => Store.set({ lang: 'en' }) }, 'Languages + ترجمة'))),
          h(ProgressCard, { next, done: doneList.length, total: flat.length, avg }))),
      h('section', { className: 'wrap chapters', id: 'chapters' },
        h('div', { className: 'chapters-head' },
          h('h2', null, t.chaptersTitle2),
          h('p', null, t.chaptersSub)),
        meta
          ? h('div', { className: 'ch-grid' }, meta.chapters.map(c => h(ChapterCard, { key: c.id, c, store, ready })))
          : h('p', { className: 'loading' }, t.loading)));
  }

  /* ============ lesson page ============ */
  function KeyTerms({ items, arItems, bilingual }) {
    const { t } = useLang();
    const [open, setOpen] = useState({});
    const allOpen = items.length > 0 && items.every((_, i) => open[i]);
    const toggleAll = () => {
      if (allOpen) return setOpen({});
      const o = {};
      items.forEach((_, i) => { o[i] = true; });
      setOpen(o);
    };
    return h('section', { className: 'terms', id: 'terms', 'data-toc': '' },
      h('div', { className: 'block-head' },
        h('div', null, h('h2', null, t.keyTerms), h('p', null, t.keyTermsHint)),
        h('button', { className: 'link-btn', onClick: toggleAll }, allOpen ? t.hideAll : t.showAll)),
      h('div', { className: 'terms-grid' },
        items.map((it, i) => {
          const arIt = bilingual && arItems && arItems[i];
          return h('div', { key: i, className: 'term' + (open[i] ? ' open' : '') },
            h('button', { className: 'term-t', onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] },
              h('span', { className: 'term-names' },
                h('span', { className: 'term-name' }, it.term),
                arIt ? h('span', { className: 'term-ar', dir: 'rtl' }, arIt.term) : null),
              h('i', { 'aria-hidden': 'true' })),
            h('div', { className: 'term-d' },
              h('div', null,
                h('p', null, it.def),
                arIt ? h('p', { className: 'ar-sub', dir: 'rtl' }, arIt.def) : null)));
        })));
  }

  function Exercises({ items, arItems, bilingual }) {
    const { t } = useLang();
    const [open, setOpen] = useState({});
    return h('section', { className: 'practice', id: 'practice', 'data-toc': '' },
      h('div', { className: 'block-head' },
        h('div', null, h('h2', null, t.practice), h('p', null, t.practiceSub))),
      h('ol', { className: 'ex-list' }, items.map((ex, i) => {
        const arEx = bilingual && arItems && arItems[i];
        return h('li', { key: i, className: 'ex' + (open[i] ? ' open' : '') },
          h('div', { className: 'ex-q' },
            h('span', { className: 'ex-n', dir: 'ltr' }, i + 1),
            h('div', { className: 'ex-text' },
              h('p', null, ex.prompt),
              arEx ? h('p', { className: 'ar-sub', dir: 'rtl' }, arEx.prompt) : null)),
          h('button', { className: 'ghost sm', onClick: () => setOpen({ ...open, [i]: !open[i] }), 'aria-expanded': !!open[i] }, open[i] ? t.hideSol : t.showSol),
          h('div', { className: 'ex-sol' },
            h('div', null,
              h('p', { className: 'ex-sol-text' }, ex.solution),
              arEx ? h('p', { className: 'ar-sub ex-sol-ar', dir: 'rtl' }, arEx.solution) : null)));
      })));
  }

  function Lesson({ id, meta, zen, onToggleZen }) {
    const { t, lang } = useLang();
    const store = useStore();
    const [data, setData] = useState(null);
    const [arData, setArData] = useState(null);
    const [err, setErr] = useState(null);
    const [quizOpen, setQuizOpen] = useState(!!((Store.data.lessons || {})[id] || {}).read);
    const [readEnd, setReadEnd] = useState(false);
    const [active, setActive] = useState('');
    const bilingual = store.bilingual !== false;
    const fs = store.fontSize || 'm';
    const end = useRef(null);
    const quizRef = useRef(null);
    const bar = useRef(null);

    const flat = useMemo(() => flatLessons(meta), [meta]);
    const pos = flat.findIndex(l => l.id === id);
    const info = flat[pos];
    const prev = pos > 0 ? flat[pos - 1] : null;
    const next = pos >= 0 && pos < flat.length - 1 ? flat[pos + 1] : null;
    const chapter = info ? info.chapter : null;
    const accent = chapter ? chapter.accent : '#2f5bff';

    useEffect(() => { Store.set({ last: id }); }, [id]);

    useEffect(() => {
      setData(null); setArData(null); setErr(null); setReadEnd(false); setActive('');
      setQuizOpen(!!((Store.data.lessons || {})[id] || {}).read);
      let live = true;
      const fail = e => live && setErr(e && e.status === 404 ? 'prep' : 'fail');
      if (lang === 'en') {
        Promise.all([getJSON(`/api/lesson/en/${id}`), getJSON(`/api/lesson/ar/${id}`).catch(() => null)])
          .then(([enD, arD]) => { if (live) { setData(enD); setArData(arD); } })
          .catch(fail);
      } else {
        getJSON(`/api/lesson/ar/${id}`)
          .then(d => { if (live) { setData(d); setArData(null); } })
          .catch(fail);
      }
      return () => { live = false; };
    }, [id, lang]);

    useScan();

    /* reading progress, end-of-lesson detection and active table-of-contents item */
    useEffect(() => {
      if (!data) return;
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        });
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) setReadEnd(true); }, { threshold: 0 });
      if (end.current) io.observe(end.current);
      const io2 = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-90px 0px -60% 0px', threshold: 0 });
      document.querySelectorAll('[data-toc]').forEach(s => io2.observe(s));
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        io.disconnect(); io2.disconnect();
      };
    }, [data]);

    const toggleBi = () => Store.set({ bilingual: !bilingual });
    const openQuiz = () => {
      Store.setLesson(id, { read: true });
      setQuizOpen(true);
      setTimeout(() => scrollToEl(quizRef.current), 80);
    };
    const finished = (score, total) => {
      const prevBest = ((Store.data.lessons || {})[id] || {}).best;
      Store.setLesson(id, { read: true, best: Math.max(prevBest || 0, score), total });
    };

    if (err === 'prep') return h('main', { id: 'main', className: 'lesson-state', style: { '--accent': accent } }, h('h1', null, t.prepTitle), h('p', null, t.prepText), h('a', { className: 'solid', href: '#/chapters' }, t.backChapter));
    if (err) return h('main', { id: 'main', className: 'lesson-state' }, h('p', null, t.error), h('a', { className: 'solid', href: '#/chapters' }, t.backChapter));
    if (!data) return h('main', { id: 'main', className: 'lesson-state' }, h('div', { className: 'spinner', 'aria-hidden': 'true' }), h('p', { className: 'loading' }, t.loading));

    const isBi = lang === 'en' && bilingual && !!arData;
    const st = (store.lessons || {})[id] || {};
    const toc = [{ id: 'terms', label: t.keyTerms }]
      .concat(data.sections.map((s, i) => ({ id: 'sec-' + i, label: s.title, n: i + 1 })))
      .concat([{ id: 'recap', label: t.recap }, { id: 'practice', label: t.practice }, { id: 'quiz', label: t.quiz }]);
    const goTo = sid => scrollToEl(document.getElementById(sid));

    return h('main', { id: 'main', className: 'lesson', style: { '--accent': accent } },
      h('div', { className: 'read-bar', ref: bar, 'aria-hidden': 'true' }),
      h('div', { className: 'lesson-layout' },
        /* ---- sidebar ---- */
        h('aside', { className: 'l-side' },
          h('div', { className: 'side-in' },
            h('a', { className: 'side-back', href: '#/chapters' }, h(BackIcon, { size: 15 }), t.allChapters),
            chapter ? h('div', { className: 'side-block' },
              h('p', { className: 'side-label' }, t.chapter + ' ' + chapter.id),
              h('p', { className: 'side-ch' }, lt(chapter.title, lang)),
              h('ol', { className: 'side-lessons' }, chapter.lessons.map((l, i) => {
                const fin = isDone(store, l.id);
                const cur = l.id === id;
                return h('li', { key: l.id },
                  h('a', { href: '#/lesson/' + l.id, className: 'side-lesson' + (cur ? ' on' : '') + (fin ? ' done' : ''), 'aria-current': cur ? 'page' : undefined },
                    h('span', { className: 'sl-n', dir: 'ltr' }, fin ? h(CheckIcon, { size: 12 }) : chapter.id + '.' + (i + 1)),
                    h('span', { className: 'sl-t' }, lt(l.title, lang))));
              }))) : null,
            h('nav', { className: 'side-block', 'aria-label': t.onThisPage },
              h('p', { className: 'side-label' }, t.onThisPage),
              h('ul', { className: 'side-toc' }, toc.map(it => h('li', { key: it.id },
                h('button', { className: 'toc-i' + (active === it.id ? ' on' : ''), onClick: () => goTo(it.id) },
                  it.n ? h('span', { className: 'toc-n', dir: 'ltr' }, it.n) : h('span', { className: 'toc-n dot', 'aria-hidden': 'true' }),
                  h('span', null, it.label)))))))),

        /* ---- main column ---- */
        h('article', { className: 'l-main' },
          h('header', { className: 'l-head' },
            h('nav', { className: 'crumbs', 'aria-label': 'Breadcrumb' },
              h('a', { href: '#/' }, t.home),
              h(ChevronIcon, { size: 13 }),
              chapter ? h('a', { href: '#/chapter/' + chapter.id }, t.chapter + ' ' + chapter.id + ': ' + lt(chapter.title, lang)) : null),
            h('div', { className: 'l-meta' },
              h('span', { className: 'l-tag', dir: lang === 'ar' ? 'rtl' : 'ltr' }, t.lesson + ' ' + id.replace('-', '.')),
              info ? h('span', { className: 'l-time' }, h(ClockIcon), info.minutes + ' ' + t.minRead) : null,
              st.best != null ? h('span', { className: 'l-best' }, h(CheckIcon), t.best + ': ', h('b', { dir: 'ltr' }, st.best + '/' + st.total)) : null),
            h('h1', { className: 'l-title' }, data.title),
            isBi ? h('p', { className: 'l-title-ar', dir: 'rtl' }, arData.title) : null,
            h('p', { className: 'l-hook' }, data.hook),
            isBi ? h('p', { className: 'ar-sub', dir: 'rtl' }, arData.hook) : null,
            h('div', { className: 'l-tools' },
              lang === 'en' && arData ? h('button', { className: 'tool' + (bilingual ? ' on' : ''), onClick: toggleBi, 'aria-pressed': bilingual },
                h('span', { className: 'tool-ar', 'aria-hidden': 'true' }, 'ع'), bilingual ? t.translationOn : t.translationOff) : null,
              h('div', { className: 'tool-group', role: 'group', 'aria-label': t.textSize, title: t.textSize },
                h('button', { className: 'tool sq', onClick: () => stepFont(-1), disabled: fs === 's', 'aria-label': t.textSize + ' −' }, h('span', { className: 'a-sm' }, 'A'), '−'),
                h('button', { className: 'tool sq', onClick: () => stepFont(1), disabled: fs === 'xl', 'aria-label': t.textSize + ' +' }, h('span', { className: 'a-lg' }, 'A'), '+')),
              h('button', { className: 'tool' + (zen ? ' on' : ''), onClick: onToggleZen, title: t.zenModeHint, 'aria-pressed': zen },
                h(FocusIcon), zen ? t.zenExit : t.zenMode, h('kbd', null, 'Z')))),

          h('section', { className: 'goals' },
            h('h2', null, t.youWillLearn),
            h('ul', null, data.objectives.map((o, i) => {
              const arO = isBi && arData.objectives && arData.objectives[i];
              return h('li', { key: i },
                h('span', { className: 'goal-i' }, h(CheckIcon, { size: 13 })),
                h('div', null, h('p', null, o), arO ? h('p', { className: 'ar-sub', dir: 'rtl' }, arO) : null));
            }))),

          h(KeyTerms, { items: data.keyTerms, arItems: arData && arData.keyTerms, bilingual: isBi }),

          h('div', { className: 'l-body' }, data.sections.map((s, i) => {
            const arS = isBi && arData.sections && arData.sections[i];
            return h('section', { key: s.id || i, className: 'sec', id: 'sec-' + i, 'data-toc': '' },
              h('header', { className: 'sec-head' },
                h('span', { className: 'sec-n', dir: 'ltr' }, i + 1),
                h('div', null,
                  h('h2', null, s.title),
                  arS && arS.title ? h('p', { className: 'sec-ar', dir: 'rtl' }, arS.title) : null)),
              h('div', { className: 'sec-body' }, s.blocks.map((b, k) => h(App.Block, { key: k, b, arB: arS && arS.blocks && arS.blocks[k], bilingual: isBi }))));
          })),

          h('section', { className: 'recap', id: 'recap', 'data-toc': '' },
            h('h2', null, t.recap),
            h('ul', null, data.recap.map((r, i) => {
              const arR = isBi && arData.recap && arData.recap[i];
              return h('li', { key: i },
                h('span', { className: 'recap-i' }, h(CheckIcon, { size: 13 })),
                h('div', null, h('p', null, r), arR ? h('p', { className: 'ar-sub', dir: 'rtl' }, arR) : null));
            }))),

          h(Exercises, { items: data.exercises, arItems: arData && arData.exercises, bilingual: isBi }),
          h('div', { ref: end, className: 'end-sentinel' }),

          h('section', { className: 'finish', id: 'quiz', 'data-toc': '', ref: quizRef },
            !quizOpen
              ? h('div', { className: 'finish-box' },
                  h('h2', null, t.finishTitle),
                  h('p', null, t.finishText),
                  h('button', { className: 'solid big', disabled: !readEnd, onClick: openQuiz }, t.finishBtn),
                  !readEnd ? h('p', { className: 'lock-hint' }, t.readFirst) : null)
              : h('div', { className: 'quiz-box' },
                  h('div', { className: 'quiz-head' }, h('p', { className: 'eyebrow' }, t.quiz), h('h2', null, data.title)),
                  h(App.Quiz, { lesson: data, arLesson: arData, bilingual: isBi, accent, nextLesson: next ? next.id : null, best: st.best, onDone: finished }))),

          h('nav', { className: 'l-pager', 'aria-label': t.nextLesson },
            prev ? h('a', { className: 'lp-link prev', href: '#/lesson/' + prev.id },
              h('span', { className: 'lp-k' }, h(BackIcon, { size: 14 }), t.prevLesson),
              h('span', { className: 'lp-t' }, lt(prev.title, lang))) : h('span'),
            next ? h('a', { className: 'lp-link next', href: '#/lesson/' + next.id },
              h('span', { className: 'lp-k' }, t.nextLesson, h(ChevronIcon, { size: 14 })),
              h('span', { className: 'lp-t' }, lt(next.title, lang))) : h('span')))));
  }

  /* ============ search (Ctrl + K) ============ */
  function SpotlightSearch({ open, onClose }) {
    const { t, lang } = useLang();
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    const results = useMemo(() => App.search(query, lang), [query, lang]);

    useEffect(() => {
      if (!open) return;
      setQuery(''); setActiveIdx(0);
      const id = setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
      return () => clearTimeout(id);
    }, [open]);
    useEffect(() => { setActiveIdx(0); }, [results]);

    const navigate = item => {
      onClose();
      const target = item.target || (item.type === 'lesson' ? '#/lesson/' + item.id : '#/chapter/' + item.ch);
      if (location.hash !== target) { location.hash = target; return; }
      const sel = item.type === 'demo' ? '.demo' : item.type === 'figure' ? '.b-figures' : item.type === 'term' ? '#terms' : null;
      const el = sel && document.querySelector(sel);
      if (el) scrollToEl(el);
    };
    const onKeyDown = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % (results.length || 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => (i - 1 + (results.length || 1)) % (results.length || 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (results[activeIdx]) navigate(results[activeIdx]); }
    };

    if (!open) return null;
    const badgeLabel = type => ({
      lesson: lang === 'en' ? 'Lesson' : 'درس',
      demo: lang === 'en' ? 'Lab' : 'مختبر',
      figure: lang === 'en' ? 'Person / device' : 'شخصية / جهاز',
      term: lang === 'en' ? 'Key term' : 'مصطلح'
    }[type] || type);

    return h('div', { className: 'spotlight-modal', onMouseDown: onClose, onKeyDown },
      h('div', { className: 'spotlight-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': t.search, onMouseDown: e => e.stopPropagation() },
        h('div', { className: 'spotlight-bar' },
          h('span', { className: 'spotlight-icon' }, h(SearchIcon, { size: 18 })),
          h('input', { ref: inputRef, className: 'spotlight-input', value: query, onChange: e => setQuery(e.target.value), placeholder: t.searchPh, 'aria-label': t.search }),
          h('kbd', null, 'Esc')),
        h('div', { className: 'spotlight-list', role: 'listbox' },
          results.length
            ? results.map((it, idx) => h('div', {
                key: idx, role: 'option', 'aria-selected': idx === activeIdx,
                className: 'spotlight-item' + (idx === activeIdx ? ' is-active' : ''),
                onClick: () => navigate(it), onMouseEnter: () => setActiveIdx(idx)
              },
                h('div', { className: 'spotlight-item-main' },
                  h('span', { className: 'spotlight-item-title' }, lang === 'en' ? it.title : (it.titleAr || it.title)),
                  h('span', { className: 'spotlight-item-sub', dir: lang === 'en' ? 'rtl' : 'ltr' }, lang === 'en' ? it.titleAr : it.title)),
                h('span', { className: 'spotlight-badge badge-' + it.type }, badgeLabel(it.type))))
            : h('div', { className: 'spotlight-empty' }, query.trim()
                ? (lang === 'en' ? 'No results. Try another word.' : 'لا توجد نتائج. جرّب كلمة أخرى.')
                : (lang === 'en' ? 'Type a lesson name, a term (e.g. firewall) or a person (e.g. Turing).' : 'اكتب اسم درس أو مصطلح (مثل: تشفير) أو شخصية (مثل: تورينج).'))),
        h('div', { className: 'spotlight-footer' },
          h('span', null, h('kbd', null, '↑'), h('kbd', null, '↓'), ' ', lang === 'en' ? 'move' : 'تنقّل'),
          h('span', null, h('kbd', null, 'Enter'), ' ', lang === 'en' ? 'open' : 'فتح'),
          h('span', null, h('kbd', null, 'Esc'), ' ', lang === 'en' ? 'close' : 'إغلاق'))));
  }

  /* ============ floating audio player ============ */
  function TTSPlayerBar() {
    const { t } = useLang();
    const [tts, setTts] = useState({ speaking: false, paused: false, text: '', rate: App.TTS.rate });
    useEffect(() => {
      const fn = s => setTts({ ...s });
      App.TTS.subs.add(fn);
      return () => App.TTS.subs.delete(fn);
    }, []);
    if (!tts.speaking && !tts.paused) return null;
    const rates = [0.75, 1, 1.25, 1.5];
    const nextRate = () => {
      const i = rates.indexOf(tts.rate);
      App.TTS.setRate(rates[(i + 1) % rates.length] || 1);
    };
    return h('div', { className: 'tts-player', role: 'region', 'aria-label': t.listen },
      h('span', { className: 'tts-player-icon' }, h(VolumeIcon)),
      h('span', { className: 'tts-player-text', dir: 'auto' }, tts.text),
      h('div', { className: 'tts-player-controls' },
        h('button', { className: 'tts-ctrl-btn', onClick: () => (tts.paused ? App.TTS.resume() : App.TTS.pause()), title: tts.paused ? t.resume : t.pause, 'aria-label': tts.paused ? t.resume : t.pause }, tts.paused ? h(PlayIcon) : h(PauseIcon)),
        h('button', { className: 'tts-ctrl-btn', onClick: () => App.TTS.stop(), title: t.stop, 'aria-label': t.stop }, h(StopIcon)),
        h('button', { className: 'tts-speed-btn', onClick: nextRate, title: t.speed, dir: 'ltr' }, tts.rate + 'x'),
        h('button', { className: 'tts-close-btn', onClick: () => App.TTS.stop(), title: t.close, 'aria-label': t.close }, h(CloseIcon, { size: 14 }))));
  }

  /* ============ focus mode toolbar ============ */
  function ZenToolbar({ onExit, onToggleTheme, theme }) {
    const { t } = useLang();
    const store = useStore();
    const fs = store.fontSize || 'm';
    return h('div', { className: 'zen-bar', role: 'toolbar', 'aria-label': t.zenMode },
      h('span', { className: 'zen-bar-badge' }, t.zenMode),
      h('div', { className: 'zen-bar-tools' },
        h('button', { className: 'zen-tool-btn', onClick: () => stepFont(-1), disabled: fs === 's', title: t.textSize + ' −', 'aria-label': t.textSize + ' −' }, h('span', { className: 'zen-tool-txt' }, 'A−')),
        h('button', { className: 'zen-tool-btn', onClick: () => stepFont(1), disabled: fs === 'xl', title: t.textSize + ' +', 'aria-label': t.textSize + ' +' }, h('span', { className: 'zen-tool-txt' }, 'A+')),
        h('button', { className: 'zen-tool-btn', onClick: onToggleTheme, title: theme === 'dark' ? t.lightMode : t.darkMode, 'aria-label': theme === 'dark' ? t.lightMode : t.darkMode }, theme === 'dark' ? h(SunIcon) : h(MoonIcon)),
        h('button', { className: 'zen-exit-pill', onClick: onExit, title: t.zenEsc },
          h(CloseIcon, { size: 13 }), h('span', null, t.zenExit), h('kbd', null, 'Esc'))));
  }

  /* ============ root ============ */
  let navStamp = 0;
  function parseRoute() {
    const hash = location.hash.replace(/^#/, '') || '/';
    let m;
    navStamp++;
    if ((m = hash.match(/^\/lesson\/(\d-\d)$/))) return { name: 'lesson', id: m[1], key: hash, chapter: +m[1][0] };
    if ((m = hash.match(/^\/chapter\/(\d)$/))) return { name: 'home', target: 'chapter-' + m[1], key: 'home', chapter: +m[1], stamp: navStamp };
    if (hash === '/chapters') return { name: 'home', target: 'chapters', key: 'home', stamp: navStamp };
    return { name: 'home', key: 'home' };
  }

  function Root() {
    const store = useStore();
    const lang = store.lang || null;
    const theme = store.theme || 'light';
    const fontSize = store.fontSize || 'm';
    const [zen, setZen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [route, setRoute] = useState(parseRoute());
    const [meta, setMeta] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
      const f = () => setRoute(parseRoute());
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    }, []);
    useEffect(() => {
      getJSON('/api/meta').then(setMeta).catch(() => {});
      getJSON('/api/status').then(setStatus).catch(() => {});
    }, []);
    useEffect(() => {
      if (!lang) return;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);
    useEffect(() => {
      document.documentElement.dataset.theme = theme;
      const m = document.querySelector('meta[name=theme-color]');
      if (m) m.setAttribute('content', theme === 'dark' ? '#14171c' : '#f7f7f4');
    }, [theme]);
    useEffect(() => { document.documentElement.dataset.fs = fontSize; }, [fontSize]);
    useEffect(() => { document.documentElement.dataset.zen = zen ? 'true' : 'false'; }, [zen]);
    useEffect(() => { if (route.name !== 'lesson') setZen(false); }, [route.name]);

    /* page title */
    useEffect(() => {
      if (!lang) return;
      let title = 'Maged Aboraya';
      if (route.name === 'lesson' && meta) {
        const l = flatLessons(meta).find(x => x.id === route.id);
        if (l) title = lt(l.title, lang) + ' · Maged Aboraya';
      }
      document.title = title;
    }, [route.key, lang, meta]);

    /* shortcuts: Ctrl+K or / for search, Z for focus mode, Esc to leave focus mode */
    useEffect(() => {
      const onKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(v => !v); return; }
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
        if (e.key === '/' && !searchOpen) { e.preventDefault(); setSearchOpen(true); return; }
        if (e.key === 'Escape' && zen && !searchOpen) { e.preventDefault(); setZen(false); return; }
        if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey && route.name === 'lesson' && !searchOpen) {
          e.preventDefault(); setZen(v => !v);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [zen, route.name, searchOpen]);

    /* on page change: stop audio, close search, go to top */
    useEffect(() => {
      if (!lang) return;
      App.TTS.stop();
      setSearchOpen(false);
      if (route.name === 'lesson' || !route.target) window.scrollTo(0, 0);
      return () => killAll();
    }, [route.key, lang]);

    const ctx = useMemo(() => ({ lang: lang || 'en', t: STR[lang || 'en'], dir: lang === 'ar' ? 'rtl' : 'ltr' }), [lang]);
    const switchLang = () => Store.set({ lang: lang === 'ar' ? 'en' : 'ar' });
    const toggleTheme = () => Store.set({ theme: theme === 'dark' ? 'light' : 'dark' });
    const toggleZen = () => setZen(v => !v);

    if (!lang) return h(Gate, { onPick: l => Store.set({ lang: l }) });
    return h(LangCtx.Provider, { value: ctx },
      h('a', { className: 'skip', href: '#main', onClick: e => { e.preventDefault(); const m = document.getElementById('main'); if (m) { m.setAttribute('tabindex', '-1'); m.focus(); } } }, ctx.lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'),
      h(Header, { meta, route, onOpenSearch: () => setSearchOpen(true), theme, onToggleTheme: toggleTheme, onSwitch: switchLang, zen, onToggleZen: toggleZen }),
      zen && route.name === 'lesson' ? h(ZenToolbar, { onExit: () => setZen(false), onToggleTheme: toggleTheme, theme }) : null,
      route.name === 'lesson'
        ? h(Lesson, { key: route.id + lang, id: route.id, meta, status, zen, onToggleZen: toggleZen })
        : h(Home, { key: 'home' + lang, meta, status, route }),
      h(Footer),
      h(SpotlightSearch, { open: searchOpen, onClose: () => setSearchOpen(false) }),
      h(TTSPlayerBar));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
})();
