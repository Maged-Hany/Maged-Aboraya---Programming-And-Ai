/* demos.js — small interactive labs embedded in lessons */
(function () {
  const { h, useLang } = App;
  const { useState, useMemo, useEffect } = React;

  const L = (lang, ar, en) => (lang === 'ar' ? ar : en);
  const Box = ({ title, children, note }) => {
    const { lang } = useLang();
    return h('div', { className: 'demo', 'data-reveal': '' },
      h('div', { className: 'demo-head' }, h('span', { className: 'demo-tag' }, L(lang, 'محاكي', 'SIMULATOR')), h('strong', null, title)),
      h('div', { className: 'demo-body' }, children),
      note ? h('p', { className: 'demo-note' }, note) : null);
  };

  /* ---- Moore's law ---- */
  function Moore() {
    const { lang } = useLang();
    const [year, setYear] = useState(1990);
    const n = Math.round(2300 * Math.pow(2, (year - 1971) / 2));
    const fmt = v => v >= 1e9 ? (v / 1e9).toFixed(1) + L(lang, ' مليار', ' billion') : v >= 1e6 ? (v / 1e6).toFixed(1) + L(lang, ' مليون', ' million') : v >= 1e3 ? Math.round(v / 1e3).toLocaleString('en') + L(lang, ' ألف', ' thousand') : String(v);
    const width = Math.max(1.5, (Math.log10(n) - 3) / (Math.log10(2300 * Math.pow(2, 27)) - 3) * 100);
    const years = Math.round((year - 1971));
    const subText = years === 0
      ? L(lang, 'عام الإطلاق الأول (1971): البداية بـ 2,300 ترانزستور في معالج Intel 4004', 'Launch year (1971): starting at 2,300 transistors on the Intel 4004')
      : L(lang, `بعد ${years} سنة من عام 1971 تضاعف العدد نحو ${(years / 2).toFixed(0)} مرة تقريبًا`, `${years} years after 1971, doubled about ${(years / 2).toFixed(0)} times`);
    return h(Box, { title: L(lang, 'قانون مور: محاكي مضاعفة الترانزستورات', "Moore's law: simulator"), note: L(lang, 'تقدير مبسّط: يتضاعف عدد الترانزستورات كل سنتين تقريبًا، بدءًا من معالج عام 1971 (نحو 2,300 ترانزستور).', 'Simplified estimate: transistor count doubles roughly every two years, starting from the 1971 processor (about 2,300 transistors).') },
      h('div', { className: 'moore' },
        h('div', { className: 'moore-year', dir: 'ltr' }, year),
        h('input', { type: 'range', min: 1971, max: 2025, value: year, onChange: e => setYear(+e.target.value), 'aria-label': L(lang, 'السنة', 'Year') }),
        h('div', { className: 'moore-bar' }, h('i', { style: { width: width + '%' } })),
        h('div', { className: 'moore-out' }, h('span', null, fmt(n)), h('em', null, L(lang, 'ترانزستور في الشريحة الواحدة', 'transistors on a single chip'))),
        h('div', { className: 'moore-sub' }, subText)));
  }

  /* ---- Caesar cipher ---- */
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function caesar(text, k) {
    return text.replace(/[a-z]/gi, c => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + k + 26 * 10) % 26) + base);
    });
  }
  function Caesar() {
    const { lang } = useLang();
    const [text, setText] = useState('HELLO WORLD');
    const [shift, setShift] = useState(3);
    const [mode, setMode] = useState('enc');
    const out = caesar(text, mode === 'enc' ? shift : -shift);
    return h(Box, { title: L(lang, 'محاكي شفرة قيصر', 'Caesar cipher simulator'), note: L(lang, 'تدعم الحروف الإنجليزية (A–Z). جرّب تشفير النص أو فكّ تشفيره بتغيير مقدار الإزاحة.', 'Latin letters only. Try decrypting by changing the shift.') },
      h('div', { className: 'caesar' },
        h('div', { className: 'seg' },
          ['enc', 'dec'].map(m => h('button', { type: 'button', key: m, className: mode === m ? 'on' : '', onClick: () => setMode(m) }, m === 'enc' ? L(lang, 'تشفير النص', 'Encrypt') : L(lang, 'فكّ التشفير', 'Decrypt')))),
        h('label', null, L(lang, 'النص المُراد معالجته', 'Text'), h('input', { dir: 'ltr', value: text, onChange: e => setText(e.target.value), spellCheck: false })),
        h('label', null, h('span', null, L(lang, 'مقدار الإزاحة (المفتاح): ', 'Shift: '), h('b', { dir: 'ltr' }, shift)), h('input', { type: 'range', min: 1, max: 25, value: shift, onChange: e => setShift(+e.target.value) })),
        h('div', { className: 'wheel', dir: 'ltr', 'aria-hidden': 'true' },
          h('div', null, ABC.split('').map(c => h('span', { key: c }, c))),
          h('div', { className: 'acc' }, ABC.split('').map((c, i) => h('span', { key: c }, ABC[(i + (mode === 'enc' ? shift : 26 - shift)) % 26])))),
        h('div', { className: 'out', dir: 'ltr' }, out || '…')));
  }

  /* ---- Password strength ---- */
  function Password() {
    const { lang, t } = useLang();
    const [pw, setPw] = useState('');
    const [show, setShow] = useState(false);
    const info = useMemo(() => {
      let pool = 0;
      if (/[a-z]/.test(pw)) pool += 26;
      if (/[A-Z]/.test(pw)) pool += 26;
      if (/\d/.test(pw)) pool += 10;
      if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
      const common = /^(123456|password|qwerty|admin|111111|12345678|iloveyou|0000)/i.test(pw);
      let bits = pw.length && pool ? pw.length * Math.log2(pool) : 0;
      if (common) bits = Math.min(bits, 10);
      const secs = Math.pow(2, bits) / 1e10;
      return { bits, secs, pool, common };
    }, [pw]);
    const time = s => {
      if (!pw) return '—';
      if (s < 1) return L(lang, 'أقل من ثانية واحدة', 'under a second');
      const units = [[31557600 * 1e9, L(lang, 'مليار سنة', 'billion years')], [31557600 * 1e6, L(lang, 'مليون سنة', 'million years')], [31557600, L(lang, 'سنة', 'years')], [86400, L(lang, 'يوم', 'days')], [3600, L(lang, 'ساعة', 'hours')], [60, L(lang, 'دقيقة', 'minutes')], [1, L(lang, 'ثانية', 'seconds')]];
      for (const [d, n] of units) if (s >= d) return Math.round(s / d).toLocaleString('en') + ' ' + n;
      return '—';
    };
    const level = !pw ? 0 : info.bits < 28 ? 1 : info.bits < 45 ? 2 : info.bits < 65 ? 3 : 4;
    const labels = ['', L(lang, 'ضعيفة جدًا', 'Very weak'), L(lang, 'ضعيفة', 'Weak'), L(lang, 'جيدة', 'Good'), L(lang, 'قوية جدًا', 'Strong')];
    const checks = [
      [pw.length >= 12, L(lang, '12 خانة أو أكثر', '12+ characters')],
      [/[a-z]/.test(pw) && /[A-Z]/.test(pw), L(lang, 'حروف كبيرة وصغيرة (A, a)', 'Upper and lower case')],
      [/\d/.test(pw), L(lang, 'أرقام (0–9)', 'Numbers')],
      [/[^A-Za-z0-9]/.test(pw), L(lang, 'رموز خاصة (@ # $ %)', 'Symbols')]
    ];
    return h(Box, { title: L(lang, 'محاكي قياس قوة كلمة المرور', 'Password strength simulator'), note: t.sensitiveNote + L(lang, ' لا تكتب كلمة مرورك الحقيقية هنا.', ' Do not type your real password.') },
      h('div', { className: 'pw' },
        h('div', { className: 'pw-row' },
          h('input', { dir: 'ltr', type: show ? 'text' : 'password', value: pw, placeholder: L(lang, 'اكتب كلمة مرور تجريبية لاختبارها...', 'Try a password'), onChange: e => setPw(e.target.value), autoComplete: 'off' }),
          h('button', { type: 'button', className: 'ghost', onClick: () => setShow(!show) }, show ? L(lang, 'إخفاء', 'Hide') : L(lang, 'إظهار', 'Show'))),
        h('div', { className: 'pw-meter', 'data-level': level }, [1, 2, 3, 4].map(i => h('i', { key: i, className: i <= level ? 'on' : '' }))),
        h('div', { className: 'pw-label' }, labels[level] || L(lang, 'ابدأ بكتابة كلمة مرور تجريبية', 'Type something')),
        h('div', { className: 'pw-time' }, h('span', null, L(lang, 'الزمن التقديري لكسرها (بمعدل 10 مليارات محاولة/ثانية):', 'Time to guess it (10 billion tries/second)')), h('b', null, time(info.secs))),
        h('ul', { className: 'pw-checks' }, checks.map(([ok, label], i) => h('li', { key: i, className: ok ? 'ok' : '' }, label)))));
  }

  /* ---- HTTP request/response ---- */
  const DB0 = [{ id: 1, name: 'Mona' }, { id: 7, name: 'Omar' }];
  function Http() {
    const { lang } = useLang();
    const [method, setMethod] = useState('GET');
    const [path, setPath] = useState('/students');
    const [db, setDb] = useState(DB0);
    const [log, setLog] = useState(null);
    const [busy, setBusy] = useState(false);
    const send = () => {
      if (busy) return;
      setBusy(true);
      setLog(null);
      let status = 200, text = 'OK', body = '';
      const m = path.match(/^\/students\/(\d+)$/);
      const id = m ? +m[1] : null;
      let next = db;
      if (path === '/students' || m) {
        if (method === 'GET') {
          if (id) { const s = db.find(x => x.id === id); if (s) body = JSON.stringify(s); else { status = 404; text = 'Not Found'; body = '{"error":"student not found"}'; } }
          else body = JSON.stringify(db);
        } else if (method === 'POST' && !id) { const s = { id: (db.length ? Math.max(...db.map(x => x.id)) : 0) + 1, name: 'New' }; next = [...db, s]; status = 201; text = 'Created'; body = JSON.stringify(s); }
        else if (method === 'PUT' && id) { const s = db.find(x => x.id === id); if (s) { next = db.map(x => x.id === id ? { ...x, name: 'Updated' } : x); body = '{"updated":true}'; } else { status = 404; text = 'Not Found'; body = '{"error":"student not found"}'; } }
        else if (method === 'DELETE' && id) { const s = db.find(x => x.id === id); if (s) { next = db.filter(x => x.id !== id); status = 204; text = 'No Content'; } else { status = 404; text = 'Not Found'; body = '{"error":"student not found"}'; } }
        else { status = 405; text = 'Method Not Allowed'; body = '{"error":"method not allowed here"}'; }
      } else { status = 404; text = 'Not Found'; body = '{"error":"unknown path"}'; }
      setTimeout(() => { setDb(next); setLog({ status, text, body }); setBusy(false); }, 900);
    };
    const paths = ['/students', '/students/7', '/students/99', '/teachers'];
    return h(Box, { title: L(lang, 'محاكي طلبات واستجابات HTTP', 'HTTP request simulator'), note: L(lang, 'خادم افتراضي مصغّر يحتفظ بقائمة طلاب. جرّب إرسال طلب POST ثم GET لترى تحديث البيانات مباشرة.', 'A tiny fake server keeps a list of students. Try POST, then GET, to see the change.') },
      h('div', { className: 'http' },
        h('div', { className: 'http-ctrl' },
          h('div', { className: 'seg' }, ['GET', 'POST', 'PUT', 'DELETE'].map(m => h('button', { type: 'button', key: m, className: method === m ? 'on' : '', onClick: () => setMethod(m) }, m))),
          h('select', { dir: 'ltr', value: path, onChange: e => setPath(e.target.value) }, paths.map(p => h('option', { key: p }, p))),
          h('button', { type: 'button', className: 'solid', onClick: send, disabled: busy }, L(lang, 'إرسال الطلب', 'Send'))),
        h('div', { className: 'http-wire', dir: 'ltr' },
          h('span', null, L(lang, 'Client (العميل)', 'Client')), h('div', { className: 'wire' + (busy ? ' go' : '') }, h('i', null)), h('span', null, L(lang, 'Server (الخادم)', 'Server'))),
        h('pre', { className: 'http-pre', dir: 'ltr' }, `${method} ${path} HTTP/1.1\nHost: school.example\nAccept: application/json`),
        h('pre', { className: 'http-pre res' + (log ? (log.status >= 400 ? ' bad' : ' good') : ''), dir: 'ltr' }, log ? `HTTP/1.1 ${log.status} ${log.text}\nContent-Type: application/json\n\n${log.body}` : (busy ? '…' : L(lang, '// ستظهر استجابة الخادم هنا بعد الإرسال', '// the response appears here'))),
        h('div', { className: 'http-db', dir: 'ltr' }, 'students = ' + JSON.stringify(db))));
  }

  /* ---- HTML / CSS / JS playground ---- */
  const PG0 = {
    html: '<h1>مرحباً بك في عالم الويب!</h1>\n<p>عدّل هذا الكود وشاهد النتيجة مباشرة.</p>\n<button id="btn">اضغط هنا</button>',
    css: 'body { font-family: system-ui, sans-serif; padding: 1rem; direction: rtl; }\nh1 { color: #0f9d8a; }\nbutton { padding: .5rem 1.2rem; border-radius: 8px; cursor: pointer; }',
    js: "document.getElementById('btn').addEventListener('click', () => {\n  document.querySelector('p').textContent = 'أحسنت! لقد تفاعلت الصفحة مع نقرتك بنجاح.';\n});"
  };
  const PG0_EN = {
    html: '<h1>Hello, web!</h1>\n<p>Edit me and watch the preview.</p>\n<button id="btn">Click me</button>',
    css: 'body { font-family: sans-serif; padding: 1rem; }\nh1 { color: #0f9d8a; }\nbutton { padding: .5rem 1rem; border-radius: 8px; }',
    js: "document.getElementById('btn').addEventListener('click', () => {\n  document.querySelector('p').textContent = 'You clicked the button!';\n});"
  };
  function Playground() {
    const { lang } = useLang();
    const [tab, setTab] = useState('html');
    const [src, setSrc] = useState(() => lang === 'ar' ? PG0 : PG0_EN);
    const [doc, setDoc] = useState('');
    useEffect(() => {
      const id = setTimeout(() => setDoc(`<!doctype html><html><head><meta charset="utf-8"><style>${src.css}</style></head><body>${src.html}<script>try{${src.js}}catch(e){document.body.insertAdjacentHTML('beforeend','<pre style="color:#c00">'+e.message+'</pre>')}<\/script></body></html>`), 350);
      return () => clearTimeout(id);
    }, [src]);
    return h(Box, { title: L(lang, 'محاكي الكود: HTML وCSS وJavaScript', 'Code simulator: HTML, CSS and JavaScript'), note: L(lang, 'يعمل الكود مباشرة داخل إطار معزول وآمن في متصفحك.', 'Your code runs inside a sandboxed frame in your browser.') },
      h('div', { className: 'pg' },
        h('div', { className: 'pg-edit' },
          h('div', { className: 'seg' }, ['html', 'css', 'js'].map(k => h('button', { type: 'button', key: k, className: tab === k ? 'on' : '', onClick: () => setTab(k) }, k.toUpperCase()))),
          h('textarea', { dir: 'ltr', spellCheck: false, value: src[tab], onChange: e => setSrc({ ...src, [tab]: e.target.value }) })),
        h('iframe', { className: 'pg-frame', title: 'preview', sandbox: 'allow-scripts', srcDoc: doc })));
  }

  /* ---- Contrast checker ---- */
  const lum = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  };
  function Contrast() {
    const { lang } = useLang();
    const [fg, setFg] = useState('#1d2433');
    const [bg, setBg] = useState('#ffffff');
    const a = lum(fg), b = lum(bg);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const badge = (ok, label) => h('span', { className: 'badge ' + (ok ? 'ok' : 'no') }, label + ' · ' + (ok ? L(lang, 'متوافق', 'Pass') : L(lang, 'غير متوافق', 'Fail')));
    return h(Box, { title: L(lang, 'محاكي فحص تباين الألوان (WCAG)', 'Colour contrast simulator'), note: L(lang, 'معيار WCAG العالمي: نسبة 4.5:1 على الأقل للنص العادي، و3:1 للنص الكبير (لتحقيق المستوى القياسي AA).', 'WCAG guideline: at least 4.5 for normal text and 3 for large text (level AA).') },
      h('div', { className: 'contrast' },
        h('div', { className: 'ct-pick' },
          h('label', null, L(lang, 'لون النص', 'Text colour'), h('input', { type: 'color', value: fg, onChange: e => setFg(e.target.value) })),
          h('label', null, L(lang, 'لون الخلفية', 'Background'), h('input', { type: 'color', value: bg, onChange: e => setBg(e.target.value) }))),
        h('div', { className: 'ct-sample', style: { color: fg, background: bg } }, h('b', null, L(lang, 'عنوان كبير لاختبار وضوح الرؤية', 'Large heading sample')), h('span', null, L(lang, 'هذا نص فقرة عادية لتجربة مدى سهولة القراءة وتباين الألوان على الشاشة.', 'This is normal body text to test legibility.'))),
        h('div', { className: 'ct-ratio' }, h('b', { dir: 'ltr' }, ratio.toFixed(2) + ' : 1'), badge(ratio >= 4.5, L(lang, 'نص عادي (AA)', 'Normal AA')), badge(ratio >= 3, L(lang, 'نص كبير (AA)', 'Large AA')), badge(ratio >= 7, L(lang, 'نص عادي (AAA)', 'Normal AAA')))));
  }

  App.Demos = { moore: Moore, caesar: Caesar, password: Password, http: Http, htmlplayground: Playground, contrast: Contrast };
})();
