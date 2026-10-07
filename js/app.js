(() => {
  const STORE_KEY = 'javapath-progress-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');

  // ---------- Dữ liệu & tiến độ ----------
  const weeks = window.COURSE.weeks;
  const lessons = [];
  weeks.forEach((w, wi) => w.lessons.forEach((l) => lessons.push({ ...l, week: wi })));
  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }
  const EMPTY = () => ({ done: {}, ex: {}, quiz: {}, notes: {}, last: null, updatedAt: 0 });
  let state = Object.assign(EMPTY(), load());
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }
  function save() {
    state.updatedAt = Date.now();
    persist();
    renderProgress();
    window.Sync?.push(state);   // đồng bộ lên Supabase nếu đã đăng nhập
  }

  // Cho sync.js đọc và thay tiến độ (khi tải từ máy khác về)
  window.App = {
    getState: () => state,
    setState(s) {
      state = Object.assign(EMPTY(), s);
      persist();
      route();
    },
    refresh: () => route(),
  };

  const pct = (list) => list.length ? Math.round((list.filter((l) => state.done[l.id]).length / list.length) * 100) : 0;

  // ---------- Tiện ích ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const hl = (code, lang) => {
    try { return window.hljs.highlight(code, { language: lang }).value; } catch { return esc(code); }
  };
  const TYPE_LABEL = { java: 'Java', sql: 'SQL', spring: 'Spring Boot', tool: 'Công cụ', project: 'Dự án' };

  // ---------- Sidebar ----------
  function renderSidebar() {
    const cur = location.hash;
    $('#sidebar').innerHTML = `
      <a class="side-link ${cur === '#/' || cur === '' ? 'active' : ''}" href="#/">🏠 Tổng quan</a>
      <a class="side-link ${cur === '#/sql' ? 'active' : ''}" href="#/sql">🗄️ Sân chơi SQL</a>
      ${weeks.map((w, wi) => `
        <div class="side-week">
          <div class="side-week-title"><span>Tuần ${wi + 1}</span><small>${pct(w.lessons)}%</small></div>
          ${w.lessons.map((l) => `
            <a class="side-lesson ${cur === '#/lesson/' + l.id ? 'active' : ''} ${state.done[l.id] ? 'done' : ''}" href="#/lesson/${l.id}">
              <span class="dot" aria-hidden="true">${state.done[l.id] ? '✓' : ''}</span>
              <span class="side-lesson-title">${esc(l.title)}</span>
            </a>`).join('')}
        </div>`).join('')}
    `;
  }

  function renderProgress() {
    const p = pct(lessons);
    $('#topFill').style.width = p + '%';
    $('#topPct').textContent = p + '%';
  }

  // ---------- Khối nội dung ----------
  function block(b) {
    switch (b.t) {
      case 'p': return `<p>${fmt(b.v)}</p>`;
      case 'h': return `<h3>${fmt(b.v)}</h3>`;
      case 'list': return `<ul>${b.v.map((i) => `<li>${fmt(i)}</li>`).join('')}</ul>`;
      case 'steps': return `<ol>${b.v.map((i) => `<li>${fmt(i)}</li>`).join('')}</ol>`;
      case 'tip': return `<div class="callout tip"><b>💡 Mẹo</b><div>${fmt(b.v)}</div></div>`;
      case 'warn': return `<div class="callout warn"><b>⚠️ Lưu ý</b><div>${fmt(b.v)}</div></div>`;
      case 'ts': return `<div class="callout ts"><b>🅰️ Góc nhìn Angular/TS</b><div>${fmt(b.v)}</div></div>`;
      case 'table': return `<div class="table-wrap"><table><thead><tr>${b.head.map((h) => `<th>${fmt(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'code': return codeBlock(b.v, b.lang, b.caption);
      default: return '';
    }
  }
  function codeBlock(code, lang, caption) {
    return `<figure class="code">
      <div class="code-head"><span>${esc(caption || TYPE_LABEL[lang] || lang)}</span><button class="copy" data-copy>Sao chép</button></div>
      <pre><code class="hljs language-${lang}">${hl(code, lang)}</code></pre>
    </figure>`;
  }

  // ---------- Trang tổng quan ----------
  function renderHome() {
    const next = lessons.find((l) => !state.done[l.id]);
    const last = state.last && byId[state.last];
    const total = lessons.length;
    const doneN = lessons.filter((l) => state.done[l.id]).length;
    main.innerHTML = `
      <section class="hero">
        <p class="eyebrow">Lộ trình 30 ngày · Frontend → Backend</p>
        <h1>Java, SQL & Spring Boot<br><span>từ con số 0 đến REST API đầu tiên</span></h1>
        <p class="lead">${total} bài học trong 4 tuần, mỗi bài có lý thuyết ngắn gọn, ví dụ code, bài tập thực hành và quiz. Bài SQL được chấm tự động ngay trên trình duyệt.</p>
        <div class="hero-actions">
          ${next ? `<a class="btn primary" href="#/lesson/${(last && !state.done[last.id] ? last : next).id}">${doneN ? 'Học tiếp' : 'Bắt đầu học'} →</a>` : `<span class="btn primary">🎉 Bạn đã hoàn thành lộ trình!</span>`}
          <a class="btn" href="#/sql">Mở sân chơi SQL</a>
        </div>
        <div class="stats">
          <div><b>${doneN}/${total}</b><span>bài đã xong</span></div>
          <div><b>${Object.values(state.ex).filter(Boolean).length}</b><span>bài tập đã làm</span></div>
          <div><b>${Object.keys(state.quiz).length}</b><span>quiz đã nộp</span></div>
        </div>
      </section>

      <section class="weeks">
        ${weeks.map((w, wi) => `
          <article class="week-card">
            <div class="week-head">
              <span class="week-no">Tuần ${wi + 1}</span>
              <span class="week-pct">${pct(w.lessons)}%</span>
            </div>
            <h2>${esc(w.title)}</h2>
            <p>${fmt(w.goal)}</p>
            <div class="bar"><div class="fill" style="width:${pct(w.lessons)}%"></div></div>
            <ul class="week-lessons">
              ${w.lessons.map((l) => `<li class="${state.done[l.id] ? 'done' : ''}"><a href="#/lesson/${l.id}"><span class="tag t-${l.type}">${TYPE_LABEL[l.type]}</span>${esc(l.title)}</a></li>`).join('')}
            </ul>
          </article>`).join('')}
      </section>

      <section class="panel">
        <h2>Cách học hiệu quả</h2>
        <ul>
          <li>Học <b>2–3 giờ mỗi ngày</b>, khoảng một bài mỗi ngày. Bài SQL ngắn có thể học xen kẽ cùng bài Java.</li>
          <li>Cài <b>JDK 21+</b> và <b>IntelliJ IDEA Community</b> để gõ lại mọi ví dụ. Không có máy tính thì dùng trình chạy Java online có link trong từng bài tập.</li>
          <li>Tự làm bài tập trước, bí quá mới mở gợi ý, cuối cùng mới xem lời giải.</li>
        </ul>
      </section>

      <section class="panel">
        <h2>Đồng bộ & sao lưu tiến độ</h2>
        <p id="syncHint">${window.Sync?.enabled
          ? 'Tiến độ <b>tự động lưu lên mây</b> sau mỗi thao tác. Mở web trên điện thoại, laptop hay máy ở trường đều học tiếp được, không cần đăng nhập. Mất mạng vẫn học bình thường, web sẽ lưu lại khi có mạng.'
          : 'Tiến độ đang lưu trên trình duyệt của thiết bị này.'}</p>
        <p class="muted small">Bạn vẫn có thể xuất ra file để sao lưu thủ công.</p>
        <div class="row-actions">
          <button class="btn" id="exportBtn">⬇ Xuất tiến độ</button>
          <label class="btn">⬆ Nhập tiến độ<input type="file" id="importInput" accept="application/json" hidden></label>
          <button class="btn danger" id="resetBtn">Xóa tiến độ</button>
        </div>
      </section>
    `;
    $('#exportBtn').onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'javapath-tien-do.json' });
      a.click();
      URL.revokeObjectURL(a.href);
    };
    $('#importInput').onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        state = Object.assign({ done: {}, ex: {}, quiz: {}, notes: {}, last: null }, data);
        save(); route();
        toast('Đã nhập tiến độ');
      } catch { toast('File không hợp lệ'); }
    };
    $('#resetBtn').onclick = () => {
      if (confirm('Xóa toàn bộ tiến độ trên thiết bị này?')) {
        state = { done: {}, ex: {}, quiz: {}, notes: {}, last: null };
        save(); route();
      }
    };
  }

  // ---------- Trang bài học ----------
  function renderLesson(id) {
    const l = byId[id];
    if (!l) return renderNotFound();
    if (state.last !== id) { state.last = id; save(); }
    const idx = lessons.indexOf(l);
    const prev = lessons[idx - 1], next = lessons[idx + 1];
    const exs = l.exercises || [];

    main.innerHTML = `
      <article class="lesson">
        <div class="crumbs"><a href="#/">Tổng quan</a> / Tuần ${l.week + 1} · ${esc(weeks[l.week].title)}</div>
        <header class="lesson-head">
          <div class="meta"><span class="tag t-${l.type}">${TYPE_LABEL[l.type]}</span><span>Bài ${idx + 1}/${lessons.length}</span><span>⏱ ~${l.minutes} phút</span></div>
          <h1>${esc(l.title)}</h1>
          <p class="lead">${fmt(l.summary)}</p>
        </header>

        ${l.goals ? `<div class="goals"><b>Học xong bài này bạn sẽ:</b><ul>${l.goals.map((g) => `<li>${fmt(g)}</li>`).join('')}</ul></div>` : ''}

        <div class="prose">${l.content.map(block).join('')}</div>

        ${exs.length ? `<section class="section"><h2>🛠 Thực hành</h2>${exs.map((e, i) => exercise(l, e, i)).join('')}</section>` : ''}

        ${l.quiz && l.quiz.length ? `<section class="section"><h2>✅ Kiểm tra nhanh</h2><form class="quiz" id="quiz">${l.quiz.map((q, qi) => `
          <fieldset class="q" data-q="${qi}">
            <legend>${qi + 1}. ${fmt(q.q)}</legend>
            ${q.options.map((o, oi) => `<label class="opt"><input type="radio" name="q${qi}" value="${oi}"><span>${fmt(o)}</span></label>`).join('')}
            <div class="explain" hidden></div>
          </fieldset>`).join('')}
          <div class="row-actions"><button class="btn primary" type="submit">Nộp bài</button><span class="quiz-result" id="quizResult">${state.quiz[id] != null ? `Lần trước: ${state.quiz[id]}/${l.quiz.length} câu đúng` : ''}</span></div>
        </form></section>` : ''}

        <div class="complete">
          <button class="btn ${state.done[id] ? '' : 'primary'}" id="doneBtn">${state.done[id] ? '✓ Đã hoàn thành (bấm để bỏ)' : 'Đánh dấu hoàn thành bài này'}</button>
        </div>

        <nav class="pager">
          ${prev ? `<a href="#/lesson/${prev.id}" class="btn">← ${esc(prev.title)}</a>` : '<span></span>'}
          ${next ? `<a href="#/lesson/${next.id}" class="btn">${esc(next.title)} →</a>` : '<a href="#/" class="btn">Về tổng quan</a>'}
        </nav>
      </article>
    `;

    $('#doneBtn').onclick = () => {
      state.done[id] = !state.done[id];
      save(); renderSidebar();
      if (state.done[id] && next) { toast('Tuyệt! Chuyển sang bài tiếp theo'); location.hash = '#/lesson/' + next.id; }
      else renderLesson(id);
    };

    // Quiz
    const quiz = $('#quiz');
    if (quiz) quiz.onsubmit = (e) => {
      e.preventDefault();
      let score = 0;
      l.quiz.forEach((q, qi) => {
        const fs = quiz.querySelector(`[data-q="${qi}"]`);
        const picked = fs.querySelector('input:checked');
        const ok = picked && +picked.value === q.answer;
        if (ok) score++;
        fs.classList.toggle('right', !!ok);
        fs.classList.toggle('wrong', !ok);
        fs.querySelectorAll('.opt').forEach((o, oi) => o.classList.toggle('correct', oi === q.answer));
        const ex = fs.querySelector('.explain');
        ex.hidden = false;
        ex.innerHTML = (ok ? '<b>Đúng.</b> ' : '<b>Chưa đúng.</b> ') + fmt(q.explain || '');
      });
      state.quiz[id] = score; save();
      $('#quizResult').textContent = `Bạn đúng ${score}/${l.quiz.length} câu` + (score === l.quiz.length ? ' 🎉' : '');
    };

    bindExercises(l);
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function exKey(l, i) { return l.id + ':' + i; }

  function exercise(l, e, i) {
    const k = exKey(l, i);
    const done = state.ex[k];
    const head = `<div class="ex-head"><span class="ex-no">Bài ${i + 1}</span><h3>${fmt(e.title)}</h3>${done ? '<span class="badge-ok">✓ Đã làm</span>' : ''}</div>
      <div class="ex-prompt">${fmt(e.prompt)}</div>`;
    if (e.kind === 'sql') {
      return `<div class="exercise" data-ex="${i}">
        ${head}
        <div class="editor"><textarea class="sql-input" spellcheck="false" rows="5" placeholder="Viết câu lệnh SQL ở đây...">${esc(state.notes[k] || '')}</textarea></div>
        <div class="row-actions">
          <button class="btn" data-act="run">▶ Chạy <kbd>Ctrl+Enter</kbd></button>
          <button class="btn primary" data-act="check">Chấm bài</button>
          <button class="btn ghost" data-act="sol">Xem lời giải</button>
        </div>
        <div class="feedback" hidden></div>
        <div class="result"></div>
        <div class="solution" hidden>${codeBlock(e.solution, 'sql', 'Lời giải')}</div>
      </div>`;
    }
    return `<div class="exercise" data-ex="${i}">
      ${head}
      <details class="scratch"><summary>📝 Nháp của bạn (tự lưu trên máy này)</summary>
        <textarea class="code-input" spellcheck="false" rows="8" placeholder="Gõ code của bạn ở đây hoặc trong IntelliJ...">${esc(state.notes[k] || '')}</textarea>
      </details>
      <div class="row-actions">
        ${e.lang === 'java' ? '<a class="btn" href="https://onecompiler.com/java" target="_blank" rel="noopener">▶ Chạy Java online ↗</a>' : ''}
        ${e.hint ? '<button class="btn ghost" data-act="hint">Gợi ý</button>' : ''}
        <button class="btn ghost" data-act="sol">Xem lời giải</button>
        <button class="btn ${done ? '' : 'primary'}" data-act="mark">${done ? '✓ Đã làm' : 'Tôi đã làm xong'}</button>
      </div>
      ${e.hint ? `<div class="hint" hidden>💡 ${fmt(e.hint)}</div>` : ''}
      <div class="solution" hidden>${codeBlock(e.solution, e.lang, 'Lời giải tham khảo')}</div>
    </div>`;
  }

  function bindExercises(l) {
    main.querySelectorAll('.exercise').forEach((box) => {
      const i = +box.dataset.ex;
      const e = l.exercises[i];
      const k = exKey(l, i);
      const input = box.querySelector('textarea');
      if (input) {
        input.addEventListener('input', () => { state.notes[k] = input.value; save(); });
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Tab') { ev.preventDefault(); input.setRangeText('    ', input.selectionStart, input.selectionEnd, 'end'); }
          if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && e.kind === 'sql') { ev.preventDefault(); box.querySelector('[data-act="run"]').click(); }
        });
      }
      box.addEventListener('click', async (ev) => {
        const act = ev.target.closest('[data-act]')?.dataset.act;
        if (!act) return;
        if (act === 'hint') box.querySelector('.hint').hidden ^= 1;
        if (act === 'sol') {
          const s = box.querySelector('.solution');
          s.hidden = !s.hidden;
          ev.target.textContent = s.hidden ? 'Xem lời giải' : 'Ẩn lời giải';
        }
        if (act === 'mark') { state.ex[k] = !state.ex[k]; save(); renderLesson(l.id); }
        if (act === 'run') await sqlRun(box, input.value);
        if (act === 'check') await sqlCheck(box, e, input.value, k);
      });
    });
  }

  // ---------- SQL ----------
  function resultTable(r) {
    if (!r.columns.length) return '<p class="muted">Câu lệnh chạy thành công (không có dữ liệu trả về).</p>';
    return `<div class="table-wrap result-table"><table><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${r.values.map((row) => `<tr>${row.map((v) => `<td>${v === null ? '<i class="null">NULL</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="muted small">${r.values.length} dòng</p>`;
  }
  async function sqlRun(box, sql) {
    const out = box.querySelector('.result');
    if (!sql.trim()) { out.innerHTML = '<p class="muted">Bạn chưa viết câu lệnh nào.</p>'; return; }
    try {
      await DB.ready;
      const db = DB.fresh();
      out.innerHTML = resultTable(DB.run(db, sql));
      db.close();
    } catch (err) { out.innerHTML = `<div class="error">Lỗi: ${esc(err.message)}</div>`; }
  }
  const norm = (r, ordered) => {
    const rows = r.values.map((row) => JSON.stringify(row.map((v) => (v === null ? null : typeof v === 'number' ? +v.toFixed(4) : String(v)))));
    return { cols: r.columns.length, rows: ordered ? rows : rows.slice().sort() };
  };
  async function sqlCheck(box, e, sql, k) {
    const fb = box.querySelector('.feedback');
    fb.hidden = false;
    if (!sql.trim()) { fb.className = 'feedback bad'; fb.textContent = 'Bạn chưa viết câu lệnh nào.'; return; }
    try {
      await DB.ready;
      const mine = DB.fresh(), ref = DB.fresh();
      let a = DB.run(mine, sql), b = DB.run(ref, e.solution);
      if (e.verify) { a = DB.run(mine, e.verify); b = DB.run(ref, e.verify); }
      mine.close(); ref.close();
      const x = norm(a, e.ordered), y = norm(b, e.ordered);
      const ok = x.cols === y.cols && JSON.stringify(x.rows) === JSON.stringify(y.rows);
      box.querySelector('.result').innerHTML = e.verify ? `<p class="muted small">Kết quả kiểm tra: <code>${esc(e.verify)}</code></p>` + resultTable(a) : resultTable(a);
      if (ok) {
        fb.className = 'feedback good';
        fb.textContent = '🎉 Chính xác! Kết quả khớp với đáp án.';
        if (!state.ex[k]) { state.ex[k] = true; save(); }
      } else {
        fb.className = 'feedback bad';
        let why = 'Kết quả chưa khớp với đáp án.';
        if (x.cols !== y.cols) why += ` Đáp án có ${y.cols} cột, của bạn có ${x.cols} cột.`;
        else if (x.rows.length !== y.rows.length) why += ` Đáp án có ${y.rows.length} dòng, của bạn có ${x.rows.length} dòng.`;
        else if (e.ordered) why += ' Kiểm tra lại thứ tự sắp xếp (ORDER BY).';
        fb.textContent = why;
      }
    } catch (err) { fb.className = 'feedback bad'; fb.textContent = 'Lỗi: ' + err.message; }
  }

  function renderPlayground() {
    const k = 'playground';
    main.innerHTML = `
      <article class="lesson">
        <div class="crumbs"><a href="#/">Tổng quan</a> / Sân chơi SQL</div>
        <header class="lesson-head">
          <h1>Sân chơi SQL</h1>
          <p class="lead">Thử bất kỳ câu lệnh nào trên CSDL mẫu "Thư viện". Mỗi lần bấm Chạy, dữ liệu được khôi phục về ban đầu nên bạn cứ thoải mái INSERT, UPDATE, DELETE.</p>
        </header>
        <div class="schema">
          ${[
            ['authors', 'Tác giả', 'id, name, country'],
            ['books', 'Sách', 'id, title, author_id → authors, category, year, price, stock'],
            ['members', 'Bạn đọc', 'id, full_name, email, city, joined_at'],
            ['loans', 'Phiếu mượn', 'id, book_id → books, member_id → members, loan_date, return_date (NULL = chưa trả)'],
          ].map(([t, vi, cols]) => `<div class="schema-card"><b>${t}</b><span>${vi}</span><code>${esc(cols)}</code></div>`).join('')}
        </div>
        <div class="exercise" id="pg">
          <div class="editor"><textarea class="sql-input" spellcheck="false" rows="8">${esc(state.notes[k] || 'SELECT b.title, a.name AS author, b.price\nFROM books b\nJOIN authors a ON a.id = b.author_id\nORDER BY b.price DESC;')}</textarea></div>
          <div class="row-actions"><button class="btn primary" data-act="run">▶ Chạy <kbd>Ctrl+Enter</kbd></button></div>
          <div class="result"></div>
        </div>
      </article>`;
    const box = $('#pg'), input = box.querySelector('textarea');
    input.addEventListener('input', () => { state.notes[k] = input.value; save(); });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab') { ev.preventDefault(); input.setRangeText('    ', input.selectionStart, input.selectionEnd, 'end'); }
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); sqlRun(box, input.value); }
    });
    box.querySelector('[data-act="run"]').onclick = () => sqlRun(box, input.value);
    sqlRun(box, input.value);
  }

  function renderNotFound() {
    main.innerHTML = `<div class="panel"><h2>Không tìm thấy trang</h2><p><a href="#/">Về trang tổng quan</a></p></div>`;
  }

  // ---------- Toast, theme, menu ----------
  function toast(msg) {
    const t = Object.assign(document.createElement('div'), { className: 'toast', textContent: msg });
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const code = b.closest('.code').querySelector('code').innerText;
    navigator.clipboard?.writeText(code).then(() => { b.textContent = 'Đã chép'; setTimeout(() => (b.textContent = 'Sao chép'), 1500); });
  });

  const savedTheme = (() => { try { return localStorage.getItem('javapath-theme'); } catch { return null; } })();
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const t = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('javapath-theme', t); } catch {}
  };

  const closeMenu = () => document.body.classList.remove('menu-open');
  $('#menuBtn').onclick = () => document.body.classList.toggle('menu-open');
  $('#scrim').onclick = closeMenu;

  // ---------- Router ----------
  function route() {
    closeMenu();
    const h = location.hash || '#/';
    const m = h.match(/^#\/lesson\/(.+)$/);
    if (m) renderLesson(decodeURIComponent(m[1]));
    else if (h === '#/sql') renderPlayground();
    else renderHome();
    renderSidebar();
    renderProgress();
  }
  window.addEventListener('hashchange', route);
  route();
  window.Sync?.init();
})();
