/* quiz.js — one-question-at-a-time quiz with instant feedback and bilingual support */
(function () {
  const { h, useLang } = App;
  const { useState, useMemo, useEffect, useRef } = React;

  function shuffled(arr) {
    let out = arr.slice();
    for (let tries = 0; tries < 6; tries++) {
      for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
      if (out.some((v, i) => v !== arr[i])) break;
    }
    return out;
  }

  function Ring({ pct, color }) {
    const r = 54, c = 2 * Math.PI * r;
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(el, { strokeDashoffset: c }, { strokeDashoffset: c * (1 - pct), duration: 1.6, ease: 'power3.out', delay: .2 });
    }, [pct]);
    return h('svg', { className: 'ring', viewBox: '0 0 128 128', 'aria-hidden': 'true' },
      h('circle', { cx: 64, cy: 64, r, className: 'ring-bg' }),
      h('circle', { ref, cx: 64, cy: 64, r, className: 'ring-fg', style: { stroke: color, strokeDasharray: c, strokeDashoffset: c }, transform: 'rotate(-90 64 64)' }));
  }

  function Question({ q, arQ, bilingual, n, total, onResult, isLast }) {
    const { t } = useLang();
    const [sel, setSel] = useState(null);           // mcq index | tf boolean
    const [pairs, setPairs] = useState({});         // match: leftIdx -> right text
    const [checked, setChecked] = useState(false);
    const rights = useMemo(() => q.type === 'match' ? shuffled(q.pairs.map(p => p[1])) : [], [q]);

    const arRightMap = useMemo(() => {
      const map = {};
      if (bilingual && q.type === 'match' && arQ && arQ.pairs) {
        q.pairs.forEach((p, idx) => {
          if (arQ.pairs[idx] && arQ.pairs[idx][1]) {
            map[p[1]] = arQ.pairs[idx][1];
          }
        });
      }
      return map;
    }, [q, arQ, bilingual]);

    const ready = q.type === 'match' ? q.pairs.every((_, idx) => !!pairs[idx]) : sel !== null;
    const isCorrect = q.type === 'mcq' ? sel === q.answer : q.type === 'tf' ? sel === q.answer : q.pairs.every((p, i) => pairs[i] === p[1]);

    const optBtn = (key, label, arLabel, value, correctValue) => {
      let cls = 'opt';
      if (sel === value) cls += ' sel';
      if (checked) { if (value === correctValue) cls += ' right'; else if (sel === value) cls += ' wrong'; }
      return h('button', { type: 'button', key, className: cls, disabled: checked, onClick: () => setSel(value) },
        h('span', { className: 'opt-k' }, typeof value === 'number' ? 'ABCD'[value] : ''),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' } },
          h('span', null, label),
          bilingual && arLabel ? h('span', { className: 'ar-opt', dir: 'rtl' }, arLabel) : null));
    };

    return h('div', { className: 'q-card' },
      h('div', { className: 'q-meta' }, h('span', null, `${t.question} ${n} / ${total}`), h('i', { className: 'q-bar' }, h('b', { style: { width: ((n - (checked ? 0 : 1)) / total * 100) + '%' } }))),
      h('div', { style: { marginBottom: '18px' } },
        h('h3', { className: 'q-text', style: { marginBottom: '4px' } }, q.q),
        bilingual && arQ && arQ.q ? h('span', { className: 'ar-sub', style: { fontSize: '15px', fontWeight: 500 }, dir: 'rtl' }, arQ.q) : null),
      q.type === 'mcq' ? h('div', { className: 'opts' }, q.options.map((o, i) => optBtn(i, o, arQ && arQ.options && arQ.options[i], i, q.answer))) : null,
      q.type === 'tf' ? h('div', { className: 'opts two' },
        optBtn('t', bilingual ? 'True · صح' : t.tTrue, null, true, q.answer),
        optBtn('f', bilingual ? 'False · غلط' : t.tFalse, null, false, q.answer)) : null,
      q.type === 'match' ? h('div', { className: 'match' },
        h('p', { className: 'q-hint' }, t.matchHint + (bilingual ? ' (وصّل كل عنصر باللي يناسبه)' : '')),
        q.pairs.map((p, i) => {
          const good = checked && pairs[i] === p[1];
          const bad = checked && pairs[i] !== p[1];
          const arP = arQ && arQ.pairs && arQ.pairs[i];
          return h('div', { key: i, className: 'm-row' + (good ? ' right' : '') + (bad ? ' wrong' : '') },
            h('div', { className: 'm-l' },
              h('span', null, p[0]),
              bilingual && arP ? h('span', { className: 'ar-opt', dir: 'rtl' }, arP[0]) : null),
            h('select', { disabled: checked, value: pairs[i] || '', onChange: e => setPairs({ ...pairs, [i]: e.target.value }) },
              h('option', { value: '' }, t.choose),
              rights.map((r, k) => h('option', { key: k, value: r }, r + (bilingual && arRightMap[r] ? ' — ' + arRightMap[r] : '')))),
            bad ? h('span', { className: 'm-fix' }, p[1] + (bilingual && arRightMap[p[1]] ? ' (' + arRightMap[p[1]] + ')' : '')) : null);
        })) : null,
      checked ? h('div', { className: 'q-fb ' + (isCorrect ? 'ok' : 'no'), role: 'status' },
        h('b', null, isCorrect ? (bilingual ? 'Correct! · إجابة صح ومظبوطة!' : t.correct) : (bilingual ? 'Not quite · مش مظبوطة، راجع النقطة دي' : t.wrong)),
        h('p', null, h('em', null, t.explanation + ': '), q.explain),
        bilingual && arQ && arQ.explain ? h('p', { className: 'ar-sub', style: { margin: '4px 0 0', background: 'rgba(0,0,0,0.04)' }, dir: 'rtl' }, arQ.explain) : null) : null,
      h('div', { className: 'q-actions' },
        !checked
          ? h('button', { type: 'button', className: 'solid', disabled: !ready, onClick: () => setChecked(true) }, t.check)
          : h('button', { type: 'button', className: 'solid', onClick: () => onResult(isCorrect) }, isLast ? t.seeResult : t.next)));
  }

  function Quiz({ lesson, arLesson, bilingual, accent, nextLesson, best, onDone }) {
    const { t } = useLang();
    const [i, setI] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [run, setRun] = useState(0);
    const total = lesson.quiz.length;
    const wrap = useRef(null);

    useEffect(() => {
      if (wrap.current) gsap.fromTo(wrap.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' });
    }, [i, done, run]);

    const answer = ok => {
      const s = score + (ok ? 1 : 0);
      if (i + 1 >= total) { setScore(s); setDone(true); onDone(s, total); }
      else { setScore(s); setI(i + 1); }
    };
    const retry = () => {
      setI(0);
      setScore(0);
      setDone(false);
      setRun(run + 1);
      setTimeout(() => {
        const el = document.querySelector('.quiz-box') || wrap.current;
        if (el) App.scrollToEl(el, 90);
      }, 50);
    };

    if (done) {
      const pct = score / total;
      return h('div', { className: 'q-result', ref: wrap },
        h('div', { className: 'ring-wrap' }, h(Ring, { pct, color: accent }), h('div', { className: 'ring-num', dir: 'ltr' }, h('b', null, score), h('span', null, '/ ' + total))),
        h('div', { className: 'res-text' },
          h('h3', null, pct >= .8 ? t.msgHigh : pct >= .5 ? t.msgMid : t.msgLow),
          h('p', null, `${t.best}: ${Math.max(best || 0, score)} / ${total}`),
          h('div', { className: 'res-actions' },
            h('button', { type: 'button', className: 'ghost', onClick: retry }, t.retry),
            nextLesson ? h('a', { className: 'solid', href: '#/lesson/' + nextLesson }, t.nextLesson) : null,
            h('a', { className: 'ghost', href: '#/chapters' }, t.backChapter))));
    }
    return h('div', { ref: wrap, key: run + '-' + i },
      h(Question, {
        key: run + '-' + i,
        q: lesson.quiz[i],
        arQ: arLesson && arLesson.quiz && arLesson.quiz[i],
        bilingual,
        n: i + 1,
        total,
        onResult: answer,
        isLast: i + 1 >= total
      }));
  }
  App.Quiz = Quiz;
})();
