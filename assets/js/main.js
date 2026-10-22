/* ---------- theme ---------- */
  const root = document.documentElement;
  let W = 0, H = 0;
  const themeBtn = document.getElementById('themeBtn');
  const themeIco = document.getElementById('themeIco');
  const themeLabel = document.getElementById('themeLabel');

  function applyTheme(mode) {
    if (mode === 'day') {
      root.classList.remove('night'); root.classList.add('day');
      themeIco.textContent = '☀️'; themeLabel.textContent = 'День';
    } else {
      root.classList.remove('day'); root.classList.add('night');
      themeIco.textContent = '🌙'; themeLabel.textContent = 'Ночь';
    }
    try { localStorage.setItem('bs-theme', mode); } catch (e) {}
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('bs-theme'); } catch (e) {}
  if (!savedTheme) {
    const h = new Date().getHours();
    savedTheme = (h >= 7 && h < 20) ? 'day' : 'night';
  }
  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    applyTheme(root.classList.contains('night') ? 'day' : 'night');
  });

  /* ---------- weather ---------- */
  const weatherBtn = document.getElementById('weatherBtn');
  const weatherIco = document.getElementById('weatherIco');
  const weatherLabel = document.getElementById('weatherLabel');
  const modes = [
    { id: 'snow',  ico: '❄️', label: 'Снег' },
    { id: 'rain',  ico: '🌧', label: 'Дождь' },
    { id: 'clear', ico: '✨', label: 'Ясно' }
  ];
  let weather = 'snow';
  try { weather = localStorage.getItem('bs-weather') || 'snow'; } catch (e) {}
  function applyWeather(id) {
    const m = modes.find(x => x.id === id) || modes[0];
    weather = m.id;
    weatherIco.textContent = m.ico;
    weatherLabel.textContent = m.label;
    try { localStorage.setItem('bs-weather', id); } catch (e) {}
    syncWeatherParticles();
  }
  weatherBtn.addEventListener('click', () => {
    const i = modes.findIndex(m => m.id === weather);
    applyWeather(modes[(i + 1) % modes.length].id);
  });
  applyWeather(weather);

  /* ---------- stars ---------- */
  const starsEl = document.getElementById('stars');
  const starCount = window.innerWidth < 720 ? 70 : 150;
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement('i');
    s.className = 'star';
    const size = Math.random() * 2 + 1;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 75}%;width:${size}px;height:${size}px;--dur:${(Math.random() * 4 + 2.5).toFixed(2)}s;animation-delay:${(Math.random() * 5).toFixed(2)}s;opacity:${(Math.random() * .6 + .2).toFixed(2)}`;
    starsEl.appendChild(s);
  }

  /* ---------- particles ---------- */
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const petals = [];
  const drops = [];
  const flakes = [];

  function makePetal() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: 2.6 + Math.random() * 3.4,
      vy: .25 + Math.random() * .65,
      vx: -.25 + Math.random() * .5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .04,
      sway: Math.random() * Math.PI * 2,
      a: .45 + Math.random() * .5
    };
  }
  function makeDrop() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      len: 10 + Math.random() * 18,
      vy: 9 + Math.random() * 11,
      vx: -1.4 - Math.random() * 1.6,
      a: .18 + Math.random() * .4
    };
  }
  function makeFlake() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: .9 + Math.random() * 2.6,
      vy: .5 + Math.random() * 1.3,
      vx: -.4 + Math.random() * .8,
      sway: Math.random() * Math.PI * 2,
      a: .35 + Math.random() * .55
    };
  }
  function syncWeatherParticles() {
    if (!W || !H) return;
    const area = (W * H) / 1000000;
    const petalTarget = Math.max(18, Math.round(26 * area));
    while (petals.length < petalTarget) petals.push(makePetal());
    petals.length = Math.min(petals.length, petalTarget + 10);

    if (weather === 'rain') {
      const n = Math.round(120 * area);
      drops.length = 0;
      for (let i = 0; i < n; i++) drops.push(makeDrop());
      flakes.length = 0;
    } else if (weather === 'snow') {
      const n = Math.round(90 * area);
      flakes.length = 0;
      for (let i = 0; i < n; i++) flakes.push(makeFlake());
      drops.length = 0;
    } else {
      drops.length = 0; flakes.length = 0;
    }
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = root.classList.contains('day') ? 'rgba(214,110,155,.8)' : 'rgba(255,168,205,.8)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    if (!W || !H) resize();
    ctx.clearRect(0, 0, W, H);
    const night = root.classList.contains('night');

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.sway += .012;
      p.x += p.vx + Math.sin(p.sway) * .45;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      if (p.x < -30) p.x = W + 20;
      if (p.x > W + 30) p.x = -20;
      drawPetal(p);
    }

    if (weather === 'snow') {
      for (let i = 0; i < flakes.length; i++) {
        const s = flakes[i];
        s.sway += .02;
        s.x += s.vx + Math.sin(s.sway) * .5;
        s.y += s.vy;
        if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
        if (s.x < -10) s.x = W + 10;
        if (s.x > W + 10) s.x = -10;
        ctx.globalAlpha = s.a;
        ctx.fillStyle = night ? '#ffffff' : 'rgba(255,255,255,.9)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (weather === 'rain') {
      ctx.lineWidth = 1;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.x += d.vx; d.y += d.vy;
        if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; }
        if (d.x < -30) d.x = W + 20;
        ctx.globalAlpha = d.a;
        ctx.strokeStyle = night ? 'rgba(190,215,255,.9)' : 'rgba(90,130,180,.6)';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 1.1, d.y - d.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(tick);
  }
  if (!reduceMotion) {
    syncWeatherParticles();
    requestAnimationFrame(tick);
  } else {
    syncWeatherParticles();
    // draw a single static frame
    petals.forEach(drawPetal);
  }

  /* ---------- nav / progress / to-top ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    toTop.classList.toggle('show', y > 700);

    document.querySelectorAll('.scenery [data-speed]').forEach(el => {
      const s = parseFloat(el.dataset.speed) || 0;
      el.style.transform = `translate3d(0, ${y * s}px, 0)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- mouse parallax ---------- */
  const heroInner = document.getElementById('heroInner');
  if (!reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - .5);
      const cy = (e.clientY / window.innerHeight - .5);
      heroInner.style.transform = `translate3d(${cx * -14}px, ${cy * -10}px, 0)`;
      document.querySelectorAll('.scenery [data-speed]').forEach(el => {
        const s = parseFloat(el.dataset.speed) || 0;
        const base = (window.scrollY * s);
        el.style.transform = `translate3d(${cx * s * 60}px, ${base + cy * s * 30}px, 0)`;
      });
    }, { passive: true });
  }

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- roles database ---------- */
  // * — занято (🌪), ~ — бронь (☁️)
  const UNIS = [
    ['Мондштадт', 'Genshin Impact', 'gi', 'Венти|Джинн|Рэйзор|Кли|Барбара|Эмбер|Дилюк|Беннет|Диона|Мона|Альбедо|Ноэлль|Сахароза|Розария|Фишль|Эола|Кэйа|Мика|Лиза|Далия'],
    ['Ли Юэ', 'Genshin Impact', 'gi', 'Гань Юй|Чун Юнь|Бай Чжу|Яо Яо|Сяо|Чжун Ли|Син Цю|Шэнь Хэ|Нин Гуан|Ци Ци|Е Лань|Бэй Доу|Кэ Цин|Юнь Цзинь|Сян Лин|Синь Янь|Янь Фэй|Ху Тао|Ка Мин|Сянь Юнь|Цзы Бай|Лань Янь'],
    ['Инадзума', 'Genshin Impact', 'gi', 'Аято|Аяка|Саю|Сара|Яэ Мико|Райдэн|Кокоми*|Ёимия|Тома|Кирара|Куки Синобу|Кадзуха|Хэйдзо|Итто|Горо*|Мидзуки'],
    ['Сумеру', 'Genshin Impact', 'gi', 'Аль-Хайтам|Фарузан|Нилу|Лайла|Дэхья|Кавех|Нахида|Кандакия|Коллеи|Тигнари|Дори|Сетос|Сайно'],
    ['Фонтейн', 'Genshin Impact', 'gi', 'Лини|Линетт|Фремине|Навия|Нёвиллет|Клоринда|Фурина|Тиори|Шеврез|Ризли|Эмилия|Сиджвин|Эскофье'],
    ['Натлан', 'Genshin Impact', 'gi', 'Качина|Муалани|Кинич|Шилонен*|Ситлали|Иансан|Мавуика|Часка|Оророн|Вареса|Ифа'],
    ['Нод-Край', 'Genshin Impact', 'gi', 'Нефер|Инеффа|Лаума|Флинс*|Рери*|Алиса|Николь Рейн|Варка|Дурин*|Ягода|Иллуга|Айно'],
    ['Снежная', 'Genshin Impact', 'gi', 'Коломбина*|Дотторе|Сандроне*|Капитано|Арлекино*|Пьеро|Тарталья*|Панталоне|Пульчинелла|Царица|Синьора|Скарамучча|Одетта|Водяница*|Митя|Валера'],
    ['Genshin · Другие', 'Genshin Impact', 'gi', 'Дайнслейф|Итэр|Люмин|Паймон*|Скирк|Сказитель'],
    ['Astral Express', 'Honkai: Star Rail', 'hsr', 'Вельт|Дань Хэн|Март 7|Стелла|Келус|Химеко'],
    ['Herta Space Station', 'Honkai: Star Rail', 'hsr', 'Арлан|Аста|Герта|Жуань Мэй'],
    ['Jarilo-VI', 'Honkai: Star Rail', 'hsr', 'Броня|Гепард|Сееле*|Клара|Лука|Наташа|Пела|Рысь|Сампо|Сервал|Хук'],
    ['Xianzhou Alliance', 'Honkai: Star Rail', 'hsr', 'Байлу|Бэйхэн|Гуйнайфэнь|Линша|Лоча|Моцзэ|Сушан|Сюэи|Тинъюнь|Фу Сюань|Фэйсяо|Ханья|ХоХо|Цзин Юань|Цзинлю|Цинцюэ|Цзяоцю|Юйкун|Юньли|Яньцин'],
    ['Stellaron Hunters', 'Honkai: Star Rail', 'hsr', 'Блэйд*|Кафка|Светлячок|Серебряный волк'],
    ['The IWC', 'Honkai: Star Rail', 'hsr', 'Авантюрин|Агат|Алмаз|Обсидиан|Опал|Перламутр|Сапфир|Сугилит|Топаз|Янтарь|Яшма'],
    ['Penacony', 'Honkai: Star Rail', 'hsr', 'Воскресенье|Галлахер|Господин Река|Зарянка|Миша'],
    ['Amphoreus', 'Honkai: Star Rail', 'hsr', 'Аглая|Анакса*|Кастория|Кирена|Мидей|Трибби*|Фаенон|Цифер'],
    ['HSR · Другие', 'Honkai: Star Rail', 'hsr', 'Аргенти|Ахерон|Бутхилл*|Искорка|Констанция|Раппа*|Черный Лебедь|Рацио'],
    ['Эоны', 'Honkai: Star Rail', 'hsr', 'Акивили|Аха|Идрила|Клипот|Лань|Лун|Мифус|Нанук|Нус|Ороборос|Тайззиронт|Терминус|Фули|ХуХ|Шипе|Эна|Яоши']
  ];

  const MARK = { f: { cls: '', ico: '·', title: 'свободно' }, b: { cls: 'busy', ico: '🌪', title: 'занято' }, h: { cls: 'hold', ico: '☁️', title: 'бронь' } };
  const groupsEl = document.getElementById('roleGroups');
  const cTotal = document.getElementById('cTotal');
  const cFree = document.getElementById('cFree');
  const cBusy = document.getElementById('cBusy');
  const cHold = document.getElementById('cHold');
  const searchInput = document.getElementById('roleSearch');
  const clearBtn = document.getElementById('roleClear');

  let allChars = [];

  UNIS.forEach(([title, game, gclass, list]) => {
    const group = document.createElement('div');
    group.className = 'role-group';
    const chars = list.split('|').map(raw => {
      let name = raw, st = 'f';
      if (raw.endsWith('*')) { name = raw.slice(0, -1); st = 'b'; }
      else if (raw.endsWith('~')) { name = raw.slice(0, -1); st = 'h'; }
      return { name, st };
    });
    const free = chars.filter(c => c.st === 'f').length;
    group.innerHTML =
      '<div class="rg-head">' +
        '<span class="rg-title">' + title + '</span>' +
        '<span class="rg-game ' + gclass + '">' + game + '</span>' +
        '<span class="rg-count">свободно <b>' + free + '</b> из ' + chars.length + '</span>' +
      '</div>' +
      '<div class="char-list"></div>';
    const listEl = group.querySelector('.char-list');
    chars.forEach(c => {
      const el = document.createElement('span');
      el.className = 'char ' + MARK[c.st].cls;
      el.dataset.name = c.name.toLowerCase();
      el.dataset.st = c.st;
      el.title = MARK[c.st].title;
      el.innerHTML = '<span class="mark">' + MARK[c.st].ico + '</span>' + c.name;
      listEl.appendChild(el);
      allChars.push({ el, st: c.st });
    });
    groupsEl.appendChild(group);
  });

  const emptyNote = document.createElement('div');
  emptyNote.className = 'empty-note';
  emptyNote.textContent = 'Ничего не найдено. Попробуй другое имя ✨';
  emptyNote.style.display = 'none';
  groupsEl.appendChild(emptyNote);

  function updateCounters() {
    let total = 0, free = 0, busy = 0, hold = 0;
    allChars.forEach(c => {
      if (c.el.classList.contains('hidden')) return;
      total++;
      if (c.st === 'f') free++; else if (c.st === 'b') busy++; else hold++;
    });
    cTotal.textContent = total;
    cFree.textContent = free;
    cBusy.textContent = busy;
    cHold.textContent = hold;
  }

  function filterRoles(q) {
    const query = q.trim().toLowerCase();
    allChars.forEach(c => {
      const hit = !query || c.el.dataset.name.includes(query);
      c.el.classList.toggle('hidden', !hit);
      c.el.classList.toggle('match', !!query && hit);
    });
    let visible = 0;
    groupsEl.querySelectorAll('.role-group').forEach(g => {
      const has = g.querySelectorAll('.char:not(.hidden)').length;
      g.classList.toggle('hidden', has === 0);
      if (has) visible += has;
    });
    emptyNote.style.display = visible ? 'none' : 'block';
    updateCounters();
  }

  searchInput.addEventListener('input', () => filterRoles(searchInput.value));
  clearBtn.addEventListener('click', () => { searchInput.value = ''; filterRoles(''); searchInput.focus(); });
  updateCounters();

  /* ---------- count-up animation ---------- */
  function animateCount(el, to, dur = 1400) {
    const t0 = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const countersBox = document.querySelector('.counters');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      countObserver.unobserve(en.target);
      animateCount(cTotal, allChars.length);
      animateCount(cFree, allChars.filter(c => c.st === 'f').length);
      animateCount(cBusy, allChars.filter(c => c.st === 'b').length);
      animateCount(cHold, allChars.filter(c => c.st === 'h').length);
    });
  }, { threshold: .3 });
  if (countersBox) countObserver.observe(countersBox);

  /* ---------- service worker (offline + install) ---------- */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('open');
      menuBtn.querySelector('.ico').textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.querySelector('.ico').textContent = '☰';
    }));
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || menuBtn.contains(e.target)) return;
      mobileMenu.classList.remove('open');
      menuBtn.querySelector('.ico').textContent = '☰';
    });
  }

  /* ---------- keyboard shortcuts ---------- */
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 't' || e.key === 'T' || e.key === 'щ' || e.key === 'Щ') {
      applyTheme(root.classList.contains('night') ? 'day' : 'night');
    } else if (e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц') {
      const i = modes.findIndex(m => m.id === weather);
      applyWeather(modes[(i + 1) % modes.length].id);
    } else if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      if (menuBtn) menuBtn.querySelector('.ico').textContent = '☰';
    }
  });