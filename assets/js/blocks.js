/* blocks.js — renderers for every lesson content block with bilingual support and real photo galleries */
(function () {
  const { h, useLang } = App;
  const { useState, useEffect, useRef } = React;

  /* Helper to render an Arabic companion subtitle when in English bilingual mode */
  const ArSub = ({ text, className }) => text ? h('span', { className: 'ar-sub' + (className ? ' ' + className : ''), dir: 'rtl' }, text) : null;

  /* Speaker SVG icon */
  const SpeakerIcon = () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
    h('path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' }),
    h('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14' }));

  /* Audio Reader Button Component */
  const TTSButton = ({ text, langHint, id }) => {
    const [speaking, setSpeaking] = useState(false);
    useEffect(() => {
      const fn = s => setSpeaking(s.speaking && s.id === id);
      App.TTS.subs.add(fn);
      return () => App.TTS.subs.delete(fn);
    }, [id]);

    const isAr = (langHint === 'ar') || /[\u0600-\u06FF]/.test(text || '');

    return h('button', {
      type: 'button',
      className: 'tts-btn' + (speaking ? ' is-active' : ''),
      onClick: e => { e.stopPropagation(); App.TTS.speak(text, langHint, id); },
      title: speaking ? (isAr ? 'إيقاف الاستماع' : 'Stop') : (isAr ? 'استمع للقراءة الصوتية' : 'Listen')
    },
      h(SpeakerIcon),
      h('span', null, speaking ? (isAr ? 'جارٍ القراءة…' : 'Playing…') : (isAr ? 'استمع' : 'Listen')));
  };

  /* Paragraph with Text-to-Speech */
  const Para = ({ b, arB, bilingual }) => {
    const text = typeof b === 'string' ? b : b.text;
    const arText = arB ? (typeof arB === 'string' ? arB : arB.text) : null;
    const pid = useRef('p-' + Math.random().toString(36).slice(2, 8)).current;

    if (bilingual && arText) {
      return h('div', { className: 'b-p-wrap', 'data-reveal': '' },
        h('div', { className: 'b-p-row' },
          h('p', { className: 'b-p', style: { flex: 1 } }, text),
          h(TTSButton, { text, langHint: 'en', id: pid })),
        h('div', { className: 'b-p-row' },
          h('p', { className: 'ar-sub', dir: 'rtl', style: { flex: 1 } }, arText),
          h(TTSButton, { text: arText, langHint: 'ar', id: pid + '-ar' })));
    }
    return h('div', { className: 'b-p-wrap', 'data-reveal': '' },
      h('div', { className: 'b-p-row' },
        h('p', { className: 'b-p', style: { flex: 1 } }, text),
        h(TTSButton, { text, langHint: 'auto', id: pid })));
  };

  /* List */
  const List = ({ b, arB, bilingual }) => h(b.style === 'numbers' ? 'ol' : 'ul', { className: 'b-list', 'data-stagger': '' },
    b.items.map((it, i) => {
      const arIt = (bilingual && arB && arB.items && arB.items[i]) || null;
      return h('li', { key: i },
        h('span', null, it),
        arIt ? h(ArSub, { text: arIt }) : null);
    }));

  /* Callout */
  const Callout = ({ b, arB, bilingual }) => {
    const arTitle = (bilingual && arB && arB.title) || null;
    const arText = (bilingual && arB && arB.text) || null;
    return h('aside', { className: 'b-callout tone-' + b.tone, 'data-reveal': '' },
      h('span', { className: 'co-mark', 'aria-hidden': 'true' }),
      h('div', null,
        h('strong', null, b.title),
        h('p', null, b.text),
        (arTitle || arText) ? h(ArSub, { text: (arTitle ? arTitle + ': ' : '') + (arText || '') }) : null));
  };

  /* Timeline */
  const Timeline = ({ b, arB, bilingual }) => h('ol', { className: 'b-timeline', 'data-draw': '' },
    h('span', { className: 'tl-line', 'aria-hidden': 'true' }, h('i', { className: 'tl-fill' })),
    b.items.map((it, i) => {
      const arIt = (bilingual && arB && arB.items && arB.items[i]) || null;
      return h('li', { key: i, 'data-reveal': 'left' },
        h('span', { className: 'tl-dot' }),
        h('div', null,
          h('b', { className: 'tl-label' }, it.label),
          h('p', null, it.text),
          arIt ? h(ArSub, { text: (arIt.label ? arIt.label + ' · ' : '') + (arIt.text || '') }) : null));
    }));

  /* Cards */
  const Cards = ({ b, arB, bilingual }) => h('div', { className: 'b-cards', 'data-stagger': '' },
    b.items.map((it, i) => {
      const arIt = (bilingual && arB && arB.items && arB.items[i]) || null;
      return h('article', { key: i, className: 'card' },
        h('span', { className: 'card-n' }, String(i + 1).padStart(2, '0')),
        h('h4', null, it.title),
        h('p', null, it.text),
        arIt ? h(ArSub, { text: (arIt.title ? arIt.title + ' — ' : '') + (arIt.text || '') }) : null);
    }));

  /* Compare */
  const Compare = ({ b, arB, bilingual }) => {
    const { lang } = useLang();
    return h('div', { className: 'b-compare', 'data-reveal': '' },
      [b.left, b.right].map((side, i) => {
        const sideKey = i === 0 ? 'left' : 'right';
        const arSide = (bilingual && arB && arB[sideKey]) || null;
        return h('div', { key: i, className: 'cmp-side s' + i },
          h('h4', null, side.title),
          arSide && arSide.title ? h('span', { className: 'ar-sub-title', style: { fontSize: '15px' }, dir: 'rtl' }, arSide.title) : null,
          h('ul', null, side.points.map((p, k) => {
            const arP = (arSide && arSide.points && arSide.points[k]) || null;
            return h('li', { key: k },
              h('span', null, p),
              arP ? h(ArSub, { text: arP }) : null);
          })));
      }),
      h('span', { className: 'cmp-vs' }, lang === 'ar' ? 'ضد' : 'VS'));
  };

  /* Steps */
  const Steps = ({ b, arB, bilingual }) => h('ol', { className: 'b-steps', 'data-stagger': '' },
    b.items.map((it, i) => {
      const arIt = (bilingual && arB && arB.items && arB.items[i]) || null;
      return h('li', { key: i },
        h('span', { className: 'st-n' }, i + 1),
        h('div', null,
          h('h4', null, it.title),
          h('p', null, it.text),
          arIt ? h(ArSub, { text: (arIt.title ? arIt.title + ' — ' : '') + (arIt.text || '') }) : null));
    }));

  /* Rotate SVG icon */
  const RotateIcon = ({ size }) => h('svg', { width: size || 12, height: size || 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } },
    h('path', { d: 'M21.5 2v6h-6' }),
    h('path', { d: 'M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67' }));

  /* Flip Cards */
  function Flip({ b, arB, bilingual }) {
    const { lang } = useLang();
    const [open, setOpen] = useState({});
    return h('div', { className: 'b-flip', 'data-stagger': '' },
      b.items.map((it, i) => {
        const arIt = (bilingual && arB && arB.items && arB.items[i]) || null;
        return h('button', {
          key: i,
          type: 'button',
          className: 'fl' + (open[i] ? ' open' : ''),
          'aria-pressed': !!open[i],
          onClick: () => setOpen({ ...open, [i]: !open[i] })
        },
          h('span', { className: 'fl-in' },
            h('span', { className: 'fl-face fl-front' },
              h('span', { className: 'fl-body' },
                h('span', { className: 'fl-front-title' }, it.front),
                arIt && arIt.front ? h('span', { className: 'ar-sub', dir: 'rtl' }, arIt.front) : null),
              h('span', { className: 'fl-hint' },
                h(RotateIcon, { size: 12 }),
                h('span', null, lang === 'ar' ? 'اضغط لقلب البطاقة' : 'Click to flip'))),
            h('span', { className: 'fl-face fl-back' },
              h('span', { className: 'fl-body' },
                h('span', { className: 'fl-back-title' }, it.back),
                arIt && arIt.back ? h('span', { className: 'ar-sub', dir: 'rtl' }, arIt.back) : null),
              h('span', { className: 'fl-back-hint' },
                h(RotateIcon, { size: 12 }),
                h('span', null, lang === 'ar' ? 'العودة إلى السؤال' : 'Click to flip back')))));
      }));
  }

  /* Table */
  const Table = ({ b, arB, bilingual }) => h('div', { className: 'b-table', 'data-reveal': '' },
    h('table', null,
      h('thead', null, h('tr', null, b.head.map((c, i) => {
        const arHead = (bilingual && arB && arB.head && arB.head[i]) || null;
        return h('th', { key: i },
          h('span', null, c),
          arHead ? h('span', { className: 'ar-head-sub', dir: 'rtl' }, arHead) : null);
      }))),
      h('tbody', null, b.rows.map((r, i) => h('tr', { key: i }, r.map((c, k) => {
        const arCell = (bilingual && arB && arB.rows && arB.rows[i] && arB.rows[i][k]) || null;
        return h('td', { key: k },
          h('span', null, c),
          arCell ? h('span', { className: 'ar-row-sub', dir: 'rtl' }, arCell) : null);
      }))))));

  /* Code Block */
  function Code({ b }) {
    const { t } = useLang();
    const [ok, setOk] = useState(false);
    const handleCopy = () => {
      const txt = b.text || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
      } else {
        fallbackCopy(txt);
      }
      setOk(true);
      setTimeout(() => setOk(false), 1400);
    };
    function fallbackCopy(txt) {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
    }
    return h('div', { className: 'b-code', 'data-reveal': '' },
      h('div', { className: 'code-bar' }, h('span', null, b.lang.toUpperCase()),
        h('button', { type: 'button', onClick: handleCopy }, ok ? t.copied : t.copy)),
      h('pre', { dir: 'ltr' }, h('code', null, b.text)));
  }

  /* Stat */
  function StatItem({ it, arIt, bilingual }) {
    const ref = useRef(null);
    const m = it.value.match(/^([^\d]*)([\d][\d,]*\.?\d*)(.*)$/);
    const [shown, setShown] = useState(m ? (0).toFixed((m[2].split('.')[1] || '').length) : null);
    useEffect(() => {
      if (!m) return;
      const target = parseFloat(m[2].replace(/,/g, ''));
      const dec = (m[2].split('.')[1] || '').length;
      const el = ref.current;
      if (App.reduced) { setShown(target.toFixed(dec)); return; }
      const io = new IntersectionObserver(es => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => setShown(o.v.toFixed(dec)) });
      }, { threshold: .35 });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    const hasComma = m && m[2].includes(',');
    const formattedNum = m
      ? (hasComma ? Number(shown).toLocaleString('en') : (shown === null ? '' : shown))
      : '';
    const text = m ? m[1] + formattedNum + m[3] : it.value;
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    return h('div', { ref, className: 'stat' },
      h('b', { dir: hasArabic ? 'rtl' : 'ltr' }, text),
      h('span', null, it.label),
      bilingual && arIt && arIt.label ? h('span', { className: 'ar-row-sub', dir: 'rtl' }, arIt.label) : null);
  }
  const Stat = ({ b, arB, bilingual }) => h('div', { className: 'b-stat', 'data-reveal': '' }, b.items.map((it, i) => h(StatItem, { key: i, it, arIt: arB && arB.items && arB.items[i], bilingual })));

  /* Figures / Real Photographs Gallery with Lightbox */
  function Figures({ b, arB, bilingual }) {
    const { lang } = useLang();
    const [zoomImg, setZoomImg] = useState(null);

    useEffect(() => {
      if (!zoomImg) return;
      const onKey = e => { if (e.key === 'Escape') setZoomImg(null); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [zoomImg]);

    const normImg = src => String(src || '').replace(/^\/assets\//, './assets/');

    return h('div', { className: 'b-figures-wrap' },
      h('div', { className: 'b-figures', 'data-stagger': '' },
        b.items.map((fig, i) => {
          const arFig = (bilingual && arB && arB.items && arB.items[i]) || null;
          const imgSrc = normImg(fig.img);
          return h('figure', { key: i, className: 'fig-card' },
            h('div', {
              className: 'fig-img-wrap',
              onClick: () => setZoomImg({ ...fig, img: imgSrc, ar: arFig }),
              title: lang === 'ar' ? 'اضغط لتكبير الصورة' : 'Click to expand photo'
            },
              h('img', { className: 'fig-img', src: imgSrc, alt: fig.title, loading: 'lazy' }),
              h('span', { className: 'fig-zoom-hint' }, lang === 'ar' ? 'تكبير' : 'Expand')),
            h('figcaption', { className: 'fig-content' },
              h('span', { className: 'fig-badge' }, fig.badge + (arFig ? ' · ' + arFig.badge : '')),
              h('h4', { className: 'fig-title' }, fig.title),
              arFig && arFig.title ? h('span', { className: 'ar-sub', style: { padding: '2px 8px', fontWeight: 600, fontSize: '13px' }, dir: 'rtl' }, arFig.title) : null,
              h('p', { className: 'fig-caption' }, fig.caption),
              arFig && arFig.caption ? h('span', { className: 'ar-sub', dir: 'rtl' }, arFig.caption) : null));
        })),
      /* Lightbox Modal */
      zoomImg ? h('div', { className: 'fig-lightbox', onClick: () => setZoomImg(null), role: 'dialog', 'aria-modal': 'true' },
        h('div', { className: 'fig-lb-box', onClick: e => e.stopPropagation() },
          h('img', { className: 'fig-lb-img', src: zoomImg.img, alt: zoomImg.title }),
          h('div', { className: 'fig-lb-footer' },
            h('div', { className: 'fig-lb-info' },
              h('h3', null, zoomImg.title),
              zoomImg.ar ? h('span', { className: 'ar-sub', dir: 'rtl', style: { margin: 0, padding: 0, border: 'none', background: 'none' } }, zoomImg.ar.title) : null,
              h('p', null, zoomImg.caption),
              zoomImg.ar ? h('span', { className: 'ar-sub', dir: 'rtl', style: { margin: 0, padding: 0, border: 'none', background: 'none' } }, zoomImg.ar.caption) : null),
            h('button', { type: 'button', className: 'fig-lb-close', onClick: () => setZoomImg(null), 'aria-label': lang === 'ar' ? 'إغلاق' : 'Close' }, '×')))) : null);
  }

  /* Interactive Demos */
  const Demo = ({ b }) => {
    const C = App.Demos[b.name];
    return C ? h(C) : null;
  };

  const MAP = { p: Para, list: List, callout: Callout, timeline: Timeline, cards: Cards, compare: Compare, steps: Steps, flip: Flip, table: Table, code: Code, stat: Stat, demo: Demo, figures: Figures };
  function Block({ b, arB, bilingual }) {
    const C = MAP[b.type];
    return C ? h(C, { b, arB, bilingual }) : null;
  }
  App.Block = Block;
})();
