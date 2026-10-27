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
      open ? h('div', { className: 'cp-dropdown' },
        h('div', { className: 'cp-search' },
          h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            h('circle', { cx: 11, cy: 11, r: 8 }),
            h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })),
          h('input', {
            type: 'text',
            className: 'cp-input',
            placeholder: lang === 'ar' ? 'ابحث بالاسم أو كود الدولة...' : 'Search country or dial code...',
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
  function AuthPortal({ onAuthSuccess, onOpenTextsEditor }) {
    const [tab, setTab] = useState('register');
    const [lang, setLang] = useState('ar');
    const [tv, setTv] = useState(0);
    useEffect(() => App.subscribeTexts(() => setTv(v => v + 1)), []);
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
      setError('');
      setSuccessMsg('');

      const cleanUser = username.trim().toLowerCase();
      const cleanGmail = gmail.trim().toLowerCase();
      const cleanPhone = phone.replace(/\D/g, '');

      if (!name.trim()) {
        setError(lang === 'ar' ? 'يرجى إدخال اسمك بالكامل' : 'Please enter your full name');
        return;
      }
      if (!cleanUser || !/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
        setError(lang === 'ar' ? 'اسم المستخدم يجب أن يتكون من 3-20 حرفًا إنجليزيًا أو أرقامًا أو شرطة سفلية' : 'Username must be 3-20 letters, numbers, or underscores');
        return;
      }
      if (!cleanGmail || !cleanGmail.endsWith('@gmail.com') || cleanGmail.length < 12) {
        setError(lang === 'ar' ? 'يجب إدخال بريد Gmail صالح ينتهي بـ @gmail.com' : 'Valid Gmail address (@gmail.com) is required');
        return;
      }
      if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 15) {
        setError(lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
        return;
      }
      if (password.length < 6 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 خانات على الأقل وتحتوي على حروف وأرقام' : 'Password must be at least 6 characters with letters and numbers');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
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
      });
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
      setError('');
      setSuccessMsg('');

      if (!loginInput.trim() || !loginPassword) {
        setError(lang === 'ar' ? 'يرجى إدخال اسم المستخدم أو الجيميل وكلمة المرور' : 'Please enter username/Gmail and password');
        return;
      }

      setLoading(true);
      const res = await App.Auth.login(loginInput.trim(), loginPassword);
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
          h('div', { className: 'auth-brand' },
            h('span', { className: 'brand-mark' }, h('i'), h('i'), h('i')),
            h('span', { className: 'auth-brand-name' }, 'Maged Aboraya')),
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
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }),
            h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })),
          h('span', null, error)
        ) : null,
        successMsg ? h('div', { className: 'auth-alert success' },
          h(CheckIcon),
          h('span', null, successMsg)
        ) : null,

        tab === 'register' ? h('form', { className: 'auth-form', onSubmit: handleRegister },
          h('div', { className: 'form-group' },
            h('label', null, t.fullName),
            h('input', {
              type: 'text',
              className: 'form-input',
              placeholder: t.fullNamePh,
              value: name,
              required: true,
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
              onChange: e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }),
            h('span', { className: 'input-hint' }, lang === 'ar' ? '3-20 حرفًا إنجليزيًا أو أرقامًا بدون مسافات' : '3-20 lowercase letters, numbers, or underscores')
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.gmail),
            h('div', { className: 'input-with-icon' },
              h(MailIcon),
              h('input', {
                type: 'email',
                className: 'form-input' + (gmail && !gmail.endsWith('@gmail.com') ? ' is-invalid' : ''),
                placeholder: t.gmailPh,
                value: gmail,
                required: true,
                onChange: e => setGmail(e.target.value)
              })
            ),
            h('span', { className: 'input-hint' }, lang === 'ar' ? 'بريد جيميل رسمي ينتهي بـ @gmail.com' : 'Valid Gmail account ending in @gmail.com')
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.phone),
            h('div', { className: 'phone-input-row' },
              h(CountryPicker, { selected: country, onSelect: setCountry, lang }),
              h('input', {
                type: 'tel',
                className: 'form-input phone-input',
                placeholder: t.phonePh,
                value: phone,
                required: true,
                onChange: e => setPhone(e.target.value.replace(/\D/g, ''))
              })
            )
          ),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
              h('label', null, t.password),
              h('div', { className: 'input-with-icon' },
                h(LockIcon),
                h('input', {
                  type: showPass ? 'text' : 'password',
                  className: 'form-input',
                  placeholder: t.passwordPh,
                  value: password,
                  required: true,
                  onChange: e => setPassword(e.target.value)
                })
              )
            ),
            h('div', { className: 'form-group' },
              h('label', null, t.confirmPassword),
              h('div', { className: 'input-with-icon' },
                h(LockIcon),
                h('input', {
                  type: showPass ? 'text' : 'password',
                  className: 'form-input' + (confirmPassword && confirmPassword !== password ? ' is-invalid' : ''),
                  placeholder: t.confirmPasswordPh,
                  value: confirmPassword,
                  required: true,
                  onChange: e => setConfirmPassword(e.target.value)
                })
              )
            )
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.streamHeading),
            h('div', { className: 'stream-radio-group' },
              h('label', { className: 'stream-radio-card' + (stream === 'ar' ? ' selected' : '') },
                h('input', {
                  type: 'radio',
                  name: 'stream',
                  value: 'ar',
                  checked: stream === 'ar',
                  onChange: () => setStream('ar')
                }),
                h('span', { className: 'src-title' }, t.streamAr),
                h('span', { className: 'src-desc' }, lang === 'ar' ? 'المنهج والامتحانات كاملة باللغة العربية' : 'Arabic curriculum and assessments')
              ),
              h('label', { className: 'stream-radio-card' + (stream === 'en' ? ' selected' : '') },
                h('input', {
                  type: 'radio',
                  name: 'stream',
                  value: 'en',
                  checked: stream === 'en',
                  onChange: () => setStream('en')
                }),
                h('span', { className: 'src-title' }, t.streamEn),
                h('span', { className: 'src-desc' }, lang === 'ar' ? 'المنهج بالإنجليزية مع ترجمة عربية مرافقة' : 'English curriculum with Arabic companion')
              )
            )
          ),
          h('button', { type: 'submit', className: 'solid auth-submit-btn', disabled: loading },
            loading ? (lang === 'ar' ? 'جارٍ إنشاء الحساب...' : 'Creating Account...') : t.btnRegister),
          h('p', { className: 'auth-switch-note' },
            t.haveAccount, ' ',
            h('button', { type: 'button', className: 'auth-link-btn', onClick: () => { setTab('login'); setError(''); } }, t.goToLogin))
        ) : h('form', { className: 'auth-form', onSubmit: handleLogin },
          h('div', { className: 'form-group' },
            h('label', null, lang === 'ar' ? 'اسم المستخدم أو بريد Gmail' : 'Username or Gmail'),
            h('div', { className: 'input-with-icon' },
              h(UserIcon),
              h('input', {
                type: 'text',
                className: 'form-input',
                placeholder: lang === 'ar' ? 'ادخل اسم المستخدم أو بريدك' : 'Enter username or Gmail',
                value: loginInput,
                required: true,
                autoFocus: true,
                onChange: e => setLoginInput(e.target.value)
              })
            )
          ),
          h('div', { className: 'form-group' },
            h('label', null, t.password),
            h('div', { className: 'input-with-icon' },
              h(LockIcon),
              h('input', {
                type: showPass ? 'text' : 'password',
                className: 'form-input',
                placeholder: lang === 'ar' ? 'ادخل كلمة المرور' : 'Enter your password',
                value: loginPassword,
                required: true,
                onChange: e => setLoginPassword(e.target.value)
              })
            )
          ),
          h('button', { type: 'submit', className: 'solid auth-submit-btn', disabled: loading },
            loading ? (lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing In...') : t.btnLogin),
          h('p', { className: 'auth-switch-note' },
            t.noAccount, ' ',
            h('button', { type: 'button', className: 'auth-link-btn', onClick: () => { setTab('register'); setError(''); } }, t.goToRegister))
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
              h('span', { className: 'ag-btn-desc' }, t.guestSubtitle || (lang === 'ar' ? 'تصفح المنصة مباشرة دون حفظ للتقدم أو الدرجات' : 'Browse without saving progress or scores'))
            ),
            h('span', { className: 'ag-badge' }, t.guestNoSavePill || (lang === 'ar' ? 'بدون حفظ' : 'No Save'))
          )
        ),
        h('div', { className: 'auth-foot' },
          h('span', null, '© ' + new Date().getFullYear() + ' ' + (t.brand || 'Maged Aboraya') + '. ' + (t.footerRights || 'All rights reserved.')),
          h('div', { className: 'auth-foot-actions' },
            h('button', {
              type: 'button',
              className: 'auth-edit-texts-btn',
              onClick: onOpenTextsEditor,
              title: lang === 'ar' ? 'تعديل نصوص الموقع (Ctrl + Shift + E)' : 'Edit Site Texts (Ctrl + Shift + E)'
            },
              h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
                h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })),
              h('span', null, lang === 'ar' ? 'تعديل نصوص الموقع' : 'Edit Texts')
            ),
            h('button', {
              type: 'button',
              className: 'auth-lang-toggle',
              onClick: () => setLang(lang === 'ar' ? 'en' : 'ar')
            }, lang === 'ar' ? 'English Interface' : 'الواجهة العربية')
          )
        )
      )
    );
  }

  /* ============ student profile menu in header ============ */
  function StudentProfileMenu({ user, onLogout, lang, totalLessons, doneLessons }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      if (open) document.addEventListener('pointerdown', onDoc);
      return () => document.removeEventListener('pointerdown', onDoc);
    }, [open]);

    const isGuest = !!user.isGuest;
    const initial = isGuest ? (lang === 'ar' ? 'ز' : 'G') : (user.name || user.username || 'S')[0].toUpperCase();
    const displayName = isGuest ? (lang === 'ar' ? 'زائر' : 'Guest') : (user.name || user.username);

    return h('div', { className: 'student-profile-wrap', ref },
      h('button', {
        type: 'button',
        className: 'student-profile-btn' + (open ? ' is-active' : '') + (isGuest ? ' is-guest' : ''),
        onClick: () => setOpen(!open),
        title: isGuest ? (lang === 'ar' ? 'وضع الزائر (التقدم غير محفوظ)' : 'Guest Mode (Progress not saved)') : (lang === 'ar' ? 'ملف الطالب' : 'Student Profile')
      },
        h('span', { className: 'student-avatar' + (isGuest ? ' guest-avatar' : '') },
          isGuest
            ? h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
                h('circle', { cx: 12, cy: 7, r: 4 }))
            : initial
        ),
        h('span', { className: 'student-name-pill' }, displayName),
        isGuest ? h('span', { className: 'guest-pill-tag' }, lang === 'ar' ? 'غير محفوظ' : 'No Save') : null,
        h('span', { className: 'student-status-dot' + (isGuest ? ' is-guest' : '') })
      ),
      open ? h('div', { className: 'student-menu-card' + (isGuest ? ' is-guest' : ''), dir: lang === 'ar' ? 'rtl' : 'ltr' },
        isGuest ? h('div', { className: 'guest-menu-banner' },
          h('div', { className: 'guest-banner-head' },
            h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              h('circle', { cx: 12, cy: 12, r: 10 }),
              h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }),
              h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })),
            h('strong', null, lang === 'ar' ? 'وضع الزائر المؤقت' : 'Temporary Guest Mode')
          ),
          h('p', { className: 'guest-banner-text' },
            lang === 'ar'
              ? 'تتصفح المنصة كزائر مؤقت. لن يتم حفظ الدروس المكتملة أو درجاتك بعد إغلاق المتصفح أو الخروج.'
              : 'Browsing as a temporary guest. Completed lessons and quiz scores are not saved after closing or leaving.'
          ),
          h('button', {
            type: 'button',
            className: 'guest-register-btn',
            onClick: () => {
              setOpen(false);
              onLogout();
            }
          },
            h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
              h('circle', { cx: 8.5, cy: 7, r: 4 }),
              h('line', { x1: 20, y1: 8, x2: 20, y2: 14 }),
              h('line', { x1: 23, y1: 11, x2: 17, y2: 11 })),
            h('span', null, lang === 'ar' ? 'إنشاء حساب لحفظ تقدمك' : 'Create Account to Save Progress')
          )
        ) : h('div', { className: 'smc-head' },
          h('div', { className: 'smc-avatar-big' }, initial),
          h('div', { className: 'smc-info' },
            h('div', { className: 'smc-name' }, user.name),
            h('div', { className: 'smc-username' }, '@' + user.username),
            h('div', { className: 'smc-gmail' }, user.gmail)
          )
        ),
        h('div', { className: 'smc-details' },
          !isGuest ? h('div', { className: 'smc-row' },
            h('span', null, lang === 'ar' ? 'رقم الهاتف:' : 'Phone:'),
            h('b', { dir: 'ltr' }, (user.countryCode || '+20') + ' ' + user.phone)
          ) : null,
          h('div', { className: 'smc-row' },
            h('span', null, lang === 'ar' ? 'القسم الدراسي:' : 'Stream:'),
            h('b', null, user.stream === 'en' ? 'Languages' : 'عربي')
          ),
          h('div', { className: 'smc-row' },
            h('span', null, isGuest ? (lang === 'ar' ? 'دروس الجلسة الحالية:' : 'Session Lessons:') : (lang === 'ar' ? 'الدروس المكتملة:' : 'Lessons Done:')),
            h('b', { dir: 'ltr' }, `${doneLessons} / ${totalLessons}` + (isGuest ? (lang === 'ar' ? ' (مؤقت)' : ' (temp)') : ''))
          )
        ),
        h('button', {
          type: 'button',
          className: 'smc-logout-btn',
          onClick: () => { setOpen(false); onLogout(); }
        },
          h(LogoutIcon),
          h('span', null, isGuest ? (lang === 'ar' ? 'الخروج من وضع الزائر' : 'Exit Guest Mode') : (lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'))
        )
      ) : null
    );
  }

  /* ============ header / footer ============ */
  function Header({ meta, onSwitch, route, onOpenSearch, theme, onToggleTheme, zen, onToggleZen, authUser, onLogout }) {
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
        h('button', { className: 'lang-btn', onClick: onSwitch }, t.switchTo),
        authUser ? h(StudentProfileMenu, { user: authUser, onLogout, lang, totalLessons: total, doneLessons: done }) : null));
  }

  function Footer({ onOpenTextsEditor }) {
    const { t, lang } = useLang();
    return h('footer', { className: 'ftr' },
      h('div', { className: 'ftr-in' },
        h('div', { className: 'ftr-big', 'aria-hidden': 'true' }, t.brand || 'Maged Aboraya'),
        h('div', { className: 'ftr-row' },
          t.footerNote ? h('p', null, t.footerNote) : null,
          h('p', { className: 'copy' }, '© ', new Date().getFullYear(), ' ', t.brand || 'Maged Aboraya', '. ', t.footerRights, '.'),
          h('button', {
            type: 'button',
            className: 'ftr-edit-texts-btn',
            onClick: onOpenTextsEditor,
            title: lang === 'ar' ? 'تعديل جميع نصوص الموقع (Ctrl + Shift + E)' : 'Edit Site Texts (Ctrl + Shift + E)'
          },
            h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
              h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })),
            h('span', null, lang === 'ar' ? 'تعديل نصوص الموقع' : 'Edit Site Texts')
          )
        )
      )
    );
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
        h('div', { className: 'hero-content' },
          h('h1', { className: 'hero-title', 'data-words': '', 'data-delay': .1 },
            t.heroTitle.map((w, i) => h('span', { className: 'w', key: i }, h('span', { className: 'wi' }, w), ' '))),
          h('p', { className: 'hero-sub', 'data-reveal': '', 'data-delay': .35 }, t.heroSub),
          h('div', { className: 'hero-cta', 'data-reveal': '', 'data-delay': .55 },
            h('a', { className: 'solid big', href: '#/chapter/1' }, t.heroCta, h('span', { className: 'arr', 'aria-hidden': 'true' }, '→')),
            h('span', { className: 'scroll-hint' }, h('i'), t.scrollHint))),
        h('div', { className: 'hero-stats', 'data-reveal': 'fade', 'data-delay': .75 },
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

  /* ============ lesson video player section ============ */
  function LessonVideoSection({ id, title, watched, onMarkWatched, lang }) {
    const [editing, setEditing] = useState(false);
    const [urlInput, setUrlInput] = useState(App.StoreVideos.get(id) || '');
    const [currentUrl, setCurrentUrl] = useState(App.StoreVideos.get(id) || '');

    useEffect(() => {
      const v = App.StoreVideos.get(id) || '';
      setUrlInput(v);
      setCurrentUrl(v);
      setEditing(false);
    }, [id]);

    const saveUrl = () => {
      App.StoreVideos.set(id, urlInput);
      setCurrentUrl(urlInput);
      setEditing(false);
    };

    const ytMatch = currentUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const isYouTube = !!ytMatch;
    const ytId = ytMatch ? ytMatch[1] : null;

    return h('section', { className: 'lesson-video-sec' },
      h('div', { className: 'lesson-video-card' },
        h('div', { className: 'lesson-video-header' },
          h('div', { className: 'lvh-meta' },
            h('span', { className: 'lvh-tag' }, lang === 'ar' ? 'فيديو الشرح التفاعلي' : 'Lesson Video Lecture'),
            h('h2', { className: 'lvh-title' }, lang === 'ar' ? 'محاضرة شرح الدرس بالفيديو' : 'Interactive Video Lecture'),
            h('p', { className: 'lvh-sub' }, lang === 'ar' ? 'شاهد محاضرة الدرس أولاً لفهم الأفكار الجوهرية، ثم تابع قراءة المواد التفاعلية والتمارين أدناه.' : 'Watch the lesson video lecture first, then proceed to the detailed study materials and worked exercises below.')
          ),
          h('button', {
            type: 'button',
            className: 'lvh-edit-btn',
            onClick: () => setEditing(!editing)
          },
            h(EditIcon),
            h('span', null, editing ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : (lang === 'ar' ? 'إضافة / تعديل رابط الفيديو' : 'Set Video URL'))
          )
        ),
        editing ? h('div', { className: 'video-edit-bar' },
          h('input', {
            type: 'text',
            className: 'video-url-input',
            placeholder: lang === 'ar' ? 'https://www.youtube.com/watch?v=... أو رابط MP4 مباشر' : 'https://www.youtube.com/watch?v=... or direct MP4 URL',
            value: urlInput,
            onChange: e => setUrlInput(e.target.value)
          }),
          h('button', { type: 'button', className: 'solid video-save-btn', onClick: saveUrl }, lang === 'ar' ? 'حفظ الرابط' : 'Save URL')
        ) : null,
        h('div', { className: 'video-frame-container' },
          isYouTube ? h('iframe', {
            className: 'video-iframe',
            src: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`,
            title: 'Lesson Video',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true
          }) : (currentUrl && (currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm')) ? h('video', {
            className: 'video-native',
            src: currentUrl,
            controls: true,
            playsInline: true
          }) : h('div', { className: 'video-placeholder' },
            h('div', { className: 'vp-inner' },
              h('div', { className: 'vp-play-icon' },
                h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'currentColor' },
                  h('polygon', { points: '5 3 19 12 5 21 5 3' }))),
              h('h3', null, lang === 'ar' ? 'مشغل فيديو الدرس جاهز' : 'Lesson Video Player Ready'),
              h('p', null, lang === 'ar' ? 'يمكنك وضع رابط الفيديو الخاص بك (يوتيوب أو MP4) عبر زر "إضافة / تعديل رابط الفيديو" أعلاه.' : 'You can paste your video link (YouTube or MP4) using the "Set Video URL" button above.')
            )
          ))
        ),
        h('div', { className: 'video-footer-strip' },
          watched ? h('div', { className: 'video-done-badge' },
            h(CheckIcon),
            h('span', null, lang === 'ar' ? 'تم استكمال مشاهدة فيديو الشرح بنجاح' : 'Lecture Video Completed Successfully')
          ) : h('button', {
            type: 'button',
            className: 'video-finish-btn',
            onClick: onMarkWatched
          },
            h(CheckIcon),
            h('span', null, lang === 'ar' ? 'أنهيت مشاهدة الفيديو — الانتقال لشرح الدرس' : 'Mark Video Finished — Jump to Reading')
          ),
          h('button', {
            type: 'button',
            className: 'video-scroll-btn',
            onClick: () => {
              const el = document.getElementById('sec-0') || document.querySelector('.terms') || document.querySelector('.l-body');
              if (el) App.scrollToEl(el, 80);
            }
          },
            h('span', null, lang === 'ar' ? 'المتابعة إلى محتوى الدرس' : 'Continue to Lesson Content'),
            h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2 },
              h('polyline', { points: '6 9 12 15 18 9' }))
          )
        )
      )
    );
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
        { key: 'username', labelAr: 'تسمية حقل اسم الحساب', labelEn: 'Username Label' },
        { key: 'usernamePh', labelAr: 'المثال داخل حقل اسم الحساب', labelEn: 'Username Placeholder' },
        { key: 'gmail', labelAr: 'تسمية حقل الجيميل', labelEn: 'Gmail Label' },
        { key: 'phone', labelAr: 'تسمية حقل الهاتف', labelEn: 'Phone Label' },
        { key: 'password', labelAr: 'تسمية حقل كلمة المرور', labelEn: 'Password Label' },
        { key: 'passwordPh', labelAr: 'تنبيه شروط كلمة المرور', labelEn: 'Password Hint' },
        { key: 'confirmPassword', labelAr: 'تسمية تأكيد كلمة المرور', labelEn: 'Confirm Password Label' },
        { key: 'selectCountry', labelAr: 'تسمية اختيار الدولة', labelEn: 'Select Country Label' },
        { key: 'streamHeading', labelAr: 'سؤال اختيار الشعبة/القسم', labelEn: 'Stream Heading' },
        { key: 'streamAr', labelAr: 'خيار القسم العربي', labelEn: 'Arabic Option' },
        { key: 'streamEn', labelAr: 'خيار قسم اللغات', labelEn: 'Languages Option' },
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
        { key: 'brand', labelAr: 'اسم المنصة / الأستاذ', labelEn: 'Platform Brand Name' },
        { key: 'grade', labelAr: 'الصف الدراسي والمرحلة', labelEn: 'Grade & Stage' },
        { key: 'heroKicker', labelAr: 'شارة رأس الصفحة الرئيسية', labelEn: 'Hero Top Kicker' },
        { key: 'heroSub', labelAr: 'الوصف الرئيسي للمنصة', labelEn: 'Hero Description', isLong: true },
        { key: 'heroCta', labelAr: 'زر بدء التعلم الرئيسي', labelEn: 'Hero Start Button' },
        { key: 'manifesto', labelAr: 'فقرة رسالة المنصة وطريقة التعلم', labelEn: 'Platform Manifesto', isLong: true },
        { key: 'chaptersKicker', labelAr: 'شارة قسم الفصول', labelEn: 'Chapters Section Kicker' },
        { key: 'chaptersTitle', labelAr: 'عنوان قسم الفصول', labelEn: 'Chapters Section Title' },
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

  function SiteTextEditor({ onClose, onUpdated }) {
    const [editLang, setEditLang] = useState('ar');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQ, setSearchQ] = useState('');
    const [draft, setDraft] = useState(() => ({ ...(App.STR[editLang] || {}) }));
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState('ok');

    useEffect(() => {
      setDraft({ ...(App.STR[editLang] || {}) });
      setStatusMsg('');
    }, [editLang]);

    const handleFieldChange = (key, val) => {
      setDraft(prev => ({ ...prev, [key]: val }));
      setStatusMsg('');
    };

    const handleSave = async () => {
      setSaving(true);
      setStatusMsg('');
      const res = await App.saveSiteTexts({ [editLang]: draft });
      setSaving(false);
      if (res && res.ok) {
        setStatusType('ok');
        setStatusMsg(editLang === 'ar' ? 'تم حفظ التعديلات بنجاح وتحديث الموقع فورًا!' : 'Changes saved successfully and site updated!');
        if (onUpdated) onUpdated();
      } else {
        setStatusType('err');
        setStatusMsg(editLang === 'ar' ? 'حدث خطأ أثناء حفظ التعديلات' : 'Error saving changes');
      }
    };

    const getVisibleFields = () => {
      let fields = [];
      if (activeTab === 'all') {
        TEXT_CATEGORIES.forEach(cat => {
          cat.keys.forEach(k => {
            if (!fields.some(f => f.key === k.key)) fields.push({ ...k, catName: editLang === 'ar' ? cat.nameAr : cat.nameEn });
          });
        });
      } else {
        const cat = TEXT_CATEGORIES.find(c => c.id === activeTab);
        if (cat) {
          fields = cat.keys.map(k => ({ ...k, catName: editLang === 'ar' ? cat.nameAr : cat.nameEn }));
        }
      }

      if (searchQ.trim()) {
        const q = searchQ.trim().toLowerCase();
        fields = fields.filter(f => {
          const lAr = (f.labelAr || '').toLowerCase();
          const lEn = (f.labelEn || '').toLowerCase();
          const kName = f.key.toLowerCase();
          const val = String(draft[f.key] || '').toLowerCase();
          return lAr.includes(q) || lEn.includes(q) || kName.includes(q) || val.includes(q);
        });
      }
      return fields;
    };

    const visibleFields = getVisibleFields();

    return h('div', { className: 'ste-overlay', onClick: e => { if (e.target === e.currentTarget) onClose(); }, dir: editLang === 'ar' ? 'rtl' : 'ltr' },
      h('div', { className: 'ste-modal' },
        h('div', { className: 'ste-head' },
          h('div', { className: 'ste-title-group' },
            h('div', { className: 'ste-title' },
              h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
                h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })),
              h('span', null, editLang === 'ar' ? 'محرر نصوص الموقع' : 'Site Content Editor')
            ),
            h('p', { className: 'ste-sub' },
              editLang === 'ar'
                ? 'غيّر أي نص أو كلمة في الموقع هنا مباشرة واضغط حفظ بدون البحث في أي كود.'
                : 'Edit any text or label on the website directly and click save without touching code.'
            )
          ),
          h('div', { className: 'ste-head-actions' },
            h('div', { className: 'ste-lang-switch' },
              h('button', {
                type: 'button',
                className: 'ste-lang-btn' + (editLang === 'ar' ? ' active' : ''),
                onClick: () => setEditLang('ar')
              }, 'العربية (AR)'),
              h('button', {
                type: 'button',
                className: 'ste-lang-btn' + (editLang === 'en' ? ' active' : ''),
                onClick: () => setEditLang('en')
              }, 'English (EN)')
            ),
            h('button', {
              type: 'button',
              className: 'ste-close-btn',
              onClick: onClose,
              title: editLang === 'ar' ? 'إغلاق' : 'Close'
            },
              h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
                h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })))
          )
        ),

        h('div', { className: 'ste-toolbar' },
          h('div', { className: 'ste-search-wrap' },
            h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
              h('circle', { cx: 11, cy: 11, r: 8 }),
              h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })),
            h('input', {
              type: 'text',
              className: 'ste-search-input',
              placeholder: editLang === 'ar' ? 'ابحث عن أي نص أو كلمة لتعديلها فورًا...' : 'Search any text or label to edit instantly...',
              value: searchQ,
              onChange: e => setSearchQ(e.target.value)
            })
          ),
          h('div', { className: 'ste-tabs' },
            h('button', {
              type: 'button',
              className: 'ste-tab' + (activeTab === 'all' ? ' active' : ''),
              onClick: () => setActiveTab('all')
            }, editLang === 'ar' ? 'الكل' : 'All'),
            TEXT_CATEGORIES.map(c =>
              h('button', {
                key: c.id,
                type: 'button',
                className: 'ste-tab' + (activeTab === c.id ? ' active' : ''),
                onClick: () => setActiveTab(c.id)
              }, editLang === 'ar' ? c.nameAr : c.nameEn)
            )
          )
        ),

        h('div', { className: 'ste-body' },
          visibleFields.length === 0
            ? h('div', { className: 'ste-empty' }, editLang === 'ar' ? 'لا توجد نصوص مطابقة للبحث' : 'No matching text fields found')
            : visibleFields.map(f => {
                const val = draft[f.key] != null ? draft[f.key] : '';
                return h('div', { className: 'ste-field', key: f.key },
                  h('div', { className: 'ste-field-meta' },
                    h('label', { className: 'ste-field-label' }, editLang === 'ar' ? f.labelAr : f.labelEn),
                    h('span', { className: 'ste-field-key' }, f.key),
                    activeTab === 'all' ? h('span', { className: 'ste-field-cat' }, f.catName) : null
                  ),
                  f.isLong
                    ? h('textarea', {
                        className: 'ste-input ste-textarea',
                        rows: 3,
                        value: val,
                        onChange: e => handleFieldChange(f.key, e.target.value)
                      })
                    : h('input', {
                        type: 'text',
                        className: 'ste-input',
                        value: val,
                        onChange: e => handleFieldChange(f.key, e.target.value)
                      })
                );
              })
        ),

        h('div', { className: 'ste-foot' },
          h('div', { className: 'ste-status-wrap' },
            statusMsg
              ? h('div', { className: 'ste-status-msg ' + statusType },
                  h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                    h('polyline', { points: '20 6 9 17 4 12' })),
                  h('span', null, statusMsg)
                )
              : h('span', { className: 'ste-hint' },
                  editLang === 'ar'
                    ? 'يتم حفظ التعديلات فورًا في ملف data/texts.json وتطبيقها على الموقع مباشرة.'
                    : 'Changes are written to data/texts.json and applied live.'
                )
          ),
          h('div', { className: 'ste-foot-actions' },
            h('button', {
              type: 'button',
              className: 'ste-cancel-btn',
              onClick: onClose
            }, editLang === 'ar' ? 'إغلاق' : 'Close'),
            h('button', {
              type: 'button',
              className: 'solid ste-save-btn',
              disabled: saving,
              onClick: handleSave
            }, saving ? (editLang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (editLang === 'ar' ? 'حفظ وتطبيق التعديلات' : 'Save Changes'))
          )
        )
      )
    );
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
    const [textEditorOpen, setTextEditorOpen] = useState(false);
    const [textVersion, setTextVersion] = useState(0);

    useEffect(() => { App.initSmoothScroll(); }, []);
    useEffect(() => {
      return App.subscribeTexts(() => setTextVersion(v => v + 1));
    }, []);
    useEffect(() => {
      const f = () => setRoute(parseRoute());
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    }, []);
    useEffect(() => { getJSON('/api/meta').then(setMeta).catch(() => {}); getJSON('/api/status').then(setStatus).catch(() => {}); }, []);
    useEffect(() => {
      const activeL = lang || 'ar';
      document.documentElement.lang = activeL;
      document.documentElement.dir = activeL === 'ar' ? 'rtl' : 'ltr';
      const curT = STR[activeL];
      document.title = (curT && (curT.siteTitle || curT.brand)) || 'Maged Aboraya';
    }, [lang, textVersion]);
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

    // Shortcuts: Z to toggle Zen, Escape to exit Zen, Ctrl+K for search, Ctrl+Shift+E for site texts editor
    useEffect(() => {
      const onKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
          e.preventDefault();
          setTextEditorOpen(prev => !prev);
          return;
        }
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

    const authUser = App.useAuth();

    if (!authUser) {
      return h(React.Fragment, null,
        h(AuthPortal, {
          onAuthSuccess: (u) => {
            Store.loadUser(u.username);
            Store.set({ lang: u.stream || 'ar' });
          },
          onOpenTextsEditor: () => setTextEditorOpen(true)
        }),
        textEditorOpen ? h(SiteTextEditor, { onClose: () => setTextEditorOpen(false), onUpdated: () => setTextVersion(v => v + 1) }) : null
      );
    }

    const currentLang = lang || (authUser && authUser.stream) || 'ar';
    const ctx = useMemo(() => ({ lang: currentLang, t: STR[currentLang], dir: currentLang === 'ar' ? 'rtl' : 'ltr' }), [currentLang, textVersion]);
    const switchLang = () => Store.set({ lang: currentLang === 'ar' ? 'en' : 'ar' });
    const toggleTheme = () => Store.set({ theme: theme === 'dark' ? 'light' : 'dark' });
    const toggleZen = () => setZen(prev => !prev);

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
        onToggleZen: toggleZen,
        authUser,
        onLogout: () => App.Auth.logout()
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
      h(Footer, { onOpenTextsEditor: () => setTextEditorOpen(true) }),
      h(SpotlightSearch, { open: searchOpen, onClose: () => setSearchOpen(false), lang }),
      h(TTSPlayerBar),
      textEditorOpen ? h(SiteTextEditor, { onClose: () => setTextEditorOpen(false), onUpdated: () => setTextVersion(v => v + 1) }) : null
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
})();
